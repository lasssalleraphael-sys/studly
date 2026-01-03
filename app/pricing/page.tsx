'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { CheckCircle, Loader, Star, Info, Sparkles, Zap, Crown } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'

type BillingPeriod = 'monthly' | '6month' | 'yearly'

interface PricingTier {
  price: string
  priceId: string
  savings?: string
  perMonth?: string
}

interface Plan {
  name: string
  tagline: string
  hoursPerMonth: number
  pricing: {
    monthly: PricingTier
    '6month': PricingTier
    yearly: PricingTier
  }
  popular: boolean
  badge?: string
  includes: string
  features: string[]
  cta: string
  icon: React.ReactNode
  gradient: string
}

const plans: Plan[] = [
  {
    name: 'Starter',
    tagline: 'For light users who want notes done automatically.',
    hoursPerMonth: 5,
    pricing: {
      monthly: {
        price: '9.99',
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_MONTHLY || 'price_starter_monthly'
      },
      '6month': {
        price: '49.99',
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_6MONTH || 'price_starter_6month',
        savings: '9.95',
        perMonth: '8.33'
      },
      yearly: {
        price: '89.99',
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_YEARLY || 'price_starter_yearly',
        savings: '29.89',
        perMonth: '7.50'
      },
    },
    popular: false,
    includes: 'Includes',
    features: [
      'AI-generated notes & summaries',
      'Flashcards',
      'Note exports (PDF)',
      'Access to referral rewards',
    ],
    cta: 'Start Starter',
    icon: <Sparkles className="w-5 h-5" />,
    gradient: 'from-slate-500 to-slate-600',
  },
  {
    name: 'Pro',
    tagline: 'For serious students and exam prep.',
    hoursPerMonth: 15,
    pricing: {
      monthly: {
        price: '24.99',
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly'
      },
      '6month': {
        price: '129.99',
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_6MONTH || 'price_pro_6month',
        savings: '19.95',
        perMonth: '21.67'
      },
      yearly: {
        price: '229.99',
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY || 'price_pro_yearly',
        savings: '69.89',
        perMonth: '19.17'
      },
    },
    popular: true,
    badge: 'Most students choose this',
    includes: 'Everything in Starter, plus',
    features: [
      'Advanced flashcards',
      'AI IA / EE / TOK feedback',
      'Faster processing speed',
    ],
    cta: 'Go Pro',
    icon: <Zap className="w-5 h-5" />,
    gradient: 'from-violet-500 to-fuchsia-500',
  },
  {
    name: 'Elite',
    tagline: 'For high-performers aiming for top grades.',
    hoursPerMonth: 30,
    pricing: {
      monthly: {
        price: '49.99',
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ELITE_MONTHLY || 'price_elite_monthly'
      },
      '6month': {
        price: '269.99',
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ELITE_6MONTH || 'price_elite_6month',
        savings: '29.95',
        perMonth: '45.00'
      },
      yearly: {
        price: '479.99',
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ELITE_YEARLY || 'price_elite_yearly',
        savings: '119.89',
        perMonth: '40.00'
      },
    },
    popular: false,
    includes: 'Everything in Pro, plus',
    features: [
      'Priority processing queue',
      'Early access to new features',
      'Best performance during exam periods',
    ],
    cta: 'Unlock Elite',
    icon: <Crown className="w-5 h-5" />,
    gradient: 'from-amber-500 to-orange-500',
  },
]

function PricingContent() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly')
  const [loading, setLoading] = useState<string | null>(null)
  const [checkingSubscription, setCheckingSubscription] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Heartbeat polling to check for subscription after Stripe checkout
  const checkSubscriptionStatus = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return false

      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', session.user.id)
        .in('status', ['active', 'trialing'])
        .maybeSingle()

      return !!subscription
    } catch {
      return false
    }
  }, [supabase])

  // Start heartbeat polling after Stripe redirect
  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (!sessionId) return

    setCheckingSubscription(true)
    let attempts = 0
    const maxAttempts = 30 // 30 seconds max wait

    const pollSubscription = async () => {
      const hasSubscription = await checkSubscriptionStatus()

      if (hasSubscription) {
        // Success! Redirect to dashboard
        router.push('/dashboard')
        return
      }

      attempts++
      if (attempts < maxAttempts) {
        // Keep polling every second
        setTimeout(pollSubscription, 1000)
      } else {
        // Timeout - redirect anyway, webhook might be delayed
        setCheckingSubscription(false)
        router.push('/dashboard')
      }
    }

    pollSubscription()
  }, [searchParams, checkSubscriptionStatus, router])

  const handleSubscribe = async (priceId: string, planName: string) => {
    setLoading(planName)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        window.location.href = '/auth?redirect=/pricing'
        return
      }

      const response = await fetch('/api/stripe-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, planName }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Subscription error:', error)
      setLoading(null)
    }
  }

  const getPeriodLabel = (period: BillingPeriod): string => {
    switch (period) {
      case 'monthly': return '/ month'
      case '6month': return '/ 6 months'
      case 'yearly': return '/ year'
    }
  }

  // Show loading overlay while checking subscription after Stripe
  if (checkingSubscription) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="glass-card p-8 text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-violet-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader className="w-8 h-8 text-violet-400 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Activating your subscription...</h2>
          <p className="text-slate-400">This will only take a moment</p>
          <div className="mt-6 h-1 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Choose your <span className="text-gradient">plan</span>
          </h1>
          <p className="text-lg text-slate-400 mb-2">
            7-day free trial on all plans. Cancel anytime.
          </p>

          {/* Savings hint */}
          <p className="text-sm text-slate-500 mb-8">
            Save more with 6-month or yearly billing
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-0 p-1.5 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-full">
            {(['monthly', '6month', 'yearly'] as BillingPeriod[]).map((period) => (
              <button
                key={period}
                onClick={() => setBillingPeriod(period)}
                className={`relative px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-200 ${
                  billingPeriod === period
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {period === 'monthly' && 'Monthly'}
                {period === '6month' && '6-month'}
                {period === 'yearly' && (
                  <span className="flex items-center gap-1.5">
                    Yearly
                    <span className="px-1.5 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full">
                      BEST
                    </span>
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Monthly usage clarification */}
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full">
            <Info className="w-4 h-4 text-violet-400" />
            <p className="text-sm text-violet-300">
              Hour limits reset every month, regardless of billing period.
            </p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto items-start">
          {plans.map((plan) => {
            const currentPricing = plan.pricing[billingPeriod]
            const isPopular = plan.popular
            const planKey = plan.name.toLowerCase()

            return (
              <div
                key={plan.name}
                className={`relative glass-card overflow-hidden transition-all duration-300 ${
                  isPopular
                    ? 'border-violet-500/50 lg:scale-105 shadow-xl shadow-violet-500/10'
                    : 'hover:border-slate-600'
                }`}
              >
                {/* Popular Glow Effect */}
                {isPopular && (
                  <div className="absolute inset-0 bg-gradient-to-b from-violet-500/10 to-transparent pointer-events-none" />
                )}

                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-px left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-sm font-semibold rounded-b-xl">
                      <Star className="w-4 h-4 fill-white" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="p-6 lg:p-8 relative">
                  {/* Plan Header */}
                  <div className="mb-5 pt-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center text-white`}>
                        {plan.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                    </div>
                    <p className="text-sm text-slate-400">{plan.tagline}</p>
                  </div>

                  {/* Monthly Hours Limit */}
                  <div className="mb-5 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Monthly limit</span>
                      <span className="text-lg font-bold text-white">
                        {plan.hoursPerMonth} hours
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Resets every month</p>
                  </div>

                  {/* Price Display */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-white transition-all duration-300">
                        €{currentPricing.price}
                      </span>
                      <span className="text-slate-400 text-sm">
                        {getPeriodLabel(billingPeriod)}
                      </span>
                    </div>

                    {/* Per month breakdown */}
                    {billingPeriod !== 'monthly' && currentPricing.perMonth && (
                      <p className="text-sm text-slate-500 mt-1">
                        €{currentPricing.perMonth}/month
                      </p>
                    )}

                    {/* Savings Badge */}
                    {billingPeriod !== 'monthly' && currentPricing.savings && (
                      <div className="mt-3 transition-all duration-300">
                        <span className="inline-flex items-center px-3 py-1 bg-emerald-500/20 text-emerald-400 text-sm font-semibold rounded-full border border-emerald-500/30">
                          Save €{currentPricing.savings}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSubscribe(currentPricing.priceId, planKey)}
                    disabled={loading === planKey}
                    className={`w-full py-3.5 px-6 rounded-xl font-semibold text-base transition-all flex items-center justify-center gap-2 ${
                      isPopular
                        ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:opacity-90 shadow-lg shadow-violet-500/20'
                        : 'bg-slate-700 text-white hover:bg-slate-600'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading === planKey ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      plan.cta
                    )}
                  </button>

                  {/* Badge under CTA */}
                  {plan.badge && (
                    <p className="text-center text-sm text-violet-400 font-medium mt-3">
                      {plan.badge}
                    </p>
                  )}

                  {/* Features */}
                  <div className="mt-8">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                      {plan.includes}
                    </p>

                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                            isPopular ? 'text-violet-400' : 'text-emerald-400'
                          }`} />
                          <span className="text-sm text-slate-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Usage Clarification Footer */}
        <div className="mt-12 max-w-2xl mx-auto">
          <div className="glass-card p-5 border-amber-500/20 bg-amber-500/5">
            <h4 className="font-semibold text-amber-300 mb-2 flex items-center gap-2">
              <Info className="w-5 h-5" />
              How hour limits work
            </h4>
            <ul className="text-sm text-amber-200/80 space-y-1.5">
              <li>• Your hour limit resets on the 1st of each month</li>
              <li>• Unused hours don't roll over to the next month</li>
              <li>• 6-month and yearly plans save you money, but limits stay monthly</li>
              <li>• Example: Elite yearly = 30 hours/month (not 360/year)</li>
            </ul>
          </div>
        </div>

        {/* Trust Footer */}
        <div className="mt-12 text-center space-y-3">
          <div className="flex items-center justify-center gap-6 text-slate-500 text-sm flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="text-lg">🔒</span> Secure checkout
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-lg">↩️</span> Cancel anytime
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-lg">🎁</span> 7-day free trial
            </span>
          </div>
          <p className="text-slate-600 text-xs">
            Powered by Stripe. Your payment info is never stored on our servers.
          </p>
        </div>
      </div>
    </div>
  )
}

function PricingLoading() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Loading pricing...</p>
      </div>
    </div>
  )
}

export default function PricingPage() {
  return (
    <Suspense fallback={<PricingLoading />}>
      <PricingContent />
    </Suspense>
  )
}
