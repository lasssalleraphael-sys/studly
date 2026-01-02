import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Plan hours limits
const PLAN_LIMITS: Record<string, number> = {
  starter: 7,
  pro: 18,
  elite: 37,
}

function getHoursLimitForPlan(planName: string): number {
  return PLAN_LIMITS[planName.toLowerCase()] || 7
}

export async function POST(request: Request) {
  // Initialize clients inside the function to avoid build-time errors
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
  })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode === 'subscription') {
          const subscriptionId = session.subscription as string
          const userId = session.metadata?.user_id
          const planName = session.metadata?.plan_name || 'starter'

          if (!userId) {
            console.error('No user_id in session metadata')
            break
          }

          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          const hoursLimit = getHoursLimitForPlan(planName)

          // Create or update subscription with hours limit
          await supabase.from('subscriptions').upsert({
            user_id: userId,
            stripe_subscription_id: subscription.id,
            stripe_price_id: subscription.items.data[0].price.id,
            plan_name: planName,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            monthly_hours_limit: hoursLimit,
            hours_used: 0, // Reset hours on new subscription
          })

          // Create customer record if not exists
          await supabase.from('customers').upsert({
            user_id: userId,
            stripe_customer_id: session.customer as string,
            email: session.customer_email,
          })

          // Log payment
          if (session.payment_intent) {
            await supabase.from('payments').insert({
              user_id: userId,
              stripe_payment_intent_id: session.payment_intent as string,
              amount: session.amount_total,
              currency: session.currency,
              status: 'succeeded',
            })
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription

        // Get the current subscription to check if period changed
        const { data: currentSub } = await supabase
          .from('subscriptions')
          .select('current_period_start')
          .eq('stripe_subscription_id', subscription.id)
          .single()

        const newPeriodStart = new Date(subscription.current_period_start * 1000).toISOString()
        const periodChanged = currentSub && currentSub.current_period_start !== newPeriodStart

        const updateData: Record<string, unknown> = {
          status: subscription.status,
          current_period_start: newPeriodStart,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        }

        // Reset hours_used if the billing period changed (new month)
        if (periodChanged) {
          updateData.hours_used = 0
        }

        await supabase
          .from('subscriptions')
          .update(updateData)
          .eq('stripe_subscription_id', subscription.id)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', subscription.id)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice

        if (invoice.subscription) {
          // Get user_id from subscription
          const { data: sub } = await supabase
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_subscription_id', invoice.subscription as string)
            .single()

          if (sub) {
            await supabase.from('payments').insert({
              user_id: sub.user_id,
              stripe_invoice_id: invoice.id,
              amount: invoice.amount_paid,
              currency: invoice.currency,
              status: 'succeeded',
            })
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice

        if (invoice.subscription) {
          // Get user_id from subscription
          const { data: sub } = await supabase
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_subscription_id', invoice.subscription as string)
            .single()

          if (sub) {
            await supabase.from('payments').insert({
              user_id: sub.user_id,
              stripe_invoice_id: invoice.id,
              amount: invoice.amount_due,
              currency: invoice.currency,
              status: 'failed',
            })

            // Update subscription status
            await supabase
              .from('subscriptions')
              .update({ status: 'past_due' })
              .eq('stripe_subscription_id', invoice.subscription as string)
          }
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
