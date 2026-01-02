import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Plan limits in hours
const PLAN_LIMITS: Record<string, number> = {
  starter: 7,
  pro: 18,
  elite: 37,
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options as Record<string, unknown>)
              )
            } catch {
              // Ignore - cookies can only be set in Server Components
            }
          },
        },
      }
    )

    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's subscription with hours_used
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_name, status, hours_used, monthly_hours_limit')
      .eq('user_id', session.user.id)
      .in('status', ['active', 'trialing'])
      .single()

    if (!subscription) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 403 })
    }

    const planName = subscription.plan_name?.toLowerCase() || 'starter'
    const hoursLimit = subscription.monthly_hours_limit || PLAN_LIMITS[planName] || 7
    const hoursUsed = subscription.hours_used || 0
    const hoursRemaining = Math.max(0, hoursLimit - hoursUsed)
    const canRecord = hoursUsed < hoursLimit

    return NextResponse.json({
      planName: subscription.plan_name || 'starter',
      planLimit: hoursLimit,
      used: hoursUsed,
      remaining: hoursRemaining,
      canRecord,
    })
  } catch (error) {
    console.error('Check usage error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
