'use client'
import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { CheckCircle, Loader, Star, Info } from 'lucide-react'

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
  lecturesPerMonth: number  // Monthly limit - ALWAYS per month
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
}

const plans: Plan[] = [
  {
    name: 'Starter',
    tagline: 'For light users who want notes done automatically.',
    lecturesPerMonth: 8,
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
  },
  {
    name: 'Pro',
    tagline: 'For serious students and exam prep.',
    lecturesPerMonth: 20,
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
    badge: '⭐ Most students choose this',
    includes: 'Everything in Starter, plus',
    features: [
      'Advanced flashcards',
      'AI IA / EE / TOK feedback',
      'Faster processing speed',
    ],
    cta: 'Go Pro',
  },
  {
    name: 'Elite',
    tagline: 'For high-performers aiming for top grades.',
    lecturesPerMonth: 40,
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
  },
]

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly')
  const [loading, setLoading] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSubscribe = async (priceId: string, planName: string) => {
    setLoading(planName)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        window.location.href = '/auth'
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
      alert('Failed to start checkout. Please try again.')
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Studly Pricing
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            7-day free trial on all plans. Cancel anytime.
          </p>
          
          {/* Savings hint */}
          <p className="text-sm text-gray-500 mb-8">
            💡 Save more with 6-month or yearly billing
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-0 p-1.5 bg-gray-100 rounded-full">
            {(['monthly', '6month', 'yearly'] as BillingPeriod[]).map((period) => (
              <button
                key={period}
                onClick={() => setBillingPeriod(period)}
                className={`relative px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-200 ${
                  billingPeriod === period
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {period === 'monthly' && 'Monthly'}
                {period === '6month' && '6-month'}
                {period === 'yearly' && (
                  <span className="flex items-center gap-1.5">
                    Yearly
                    <span className="px-1.5 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full">
                      BEST
                    </span>
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* CRITICAL: Monthly usage clarification */}
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full">
            <Info className="w-4 h-4 text-blue-600" />
            <p className="text-sm text-blue-700">
              Lecture limits reset every month, regardless of billing period.
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
                className={`relative bg-white rounded-2xl transition-all duration-300 ${
                  isPopular
                    ? 'border-2 border-blue-600 shadow-xl lg:scale-105'
                    : 'border border-gray-200 shadow-sm hover:shadow-md'
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-full shadow-lg">
                      <Star className="w-4 h-4 fill-white" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="p-6 lg:p-8">
                  {/* Plan Header */}
                  <div className="mb-5">
                    <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{plan.tagline}</p>
                  </div>

                  {/* MONTHLY USAGE LIMIT - Prominent display */}
                  <div className="mb-5 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Monthly limit</span>
                      <span className="text-lg font-bold text-gray-900">
                        {plan.lecturesPerMonth} lectures
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Resets every month</p>
                  </div>

                  {/* Price Display */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-gray-900 transition-all duration-300">
                        €{currentPricing.price}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {getPeriodLabel(billingPeriod)}
                      </span>
                    </div>
                    
                    {/* Per month breakdown for non-monthly */}
                    {billingPeriod !== 'monthly' && currentPricing.perMonth && (
                      <p className="text-sm text-gray-500 mt-1">
                        €{currentPricing.perMonth}/month
                      </p>
                    )}
                    
                    {/* Savings Badge */}
                    {billingPeriod !== 'monthly' && currentPricing.savings && (
                      <div className="mt-3 transition-all duration-300">
                        <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
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
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
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

                  {/* Badge under CTA for Pro */}
                  {plan.badge && (
                    <p className="text-center text-sm text-blue-600 font-medium mt-3">
                      {plan.badge}
                    </p>
                  )}

                  {/* Features */}
                  <div className="mt-8">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                      {plan.includes}
                    </p>
                    
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                            isPopular ? 'text-blue-600' : 'text-green-500'
                          }`} />
                          <span className="text-sm text-gray-700">{feature}</span>
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
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
            <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
              <Info className="w-5 h-5" />
              How lecture limits work
            </h4>
            <ul className="text-sm text-amber-800 space-y-1.5">
              <li>• Your lecture limit resets on the 1st of each month</li>
              <li>• Unused lectures don't roll over to the next month</li>
              <li>• 6-month and yearly plans save you money, but limits stay monthly</li>
              <li>• Example: Elite yearly = 40 lectures/month (not 480/year)</li>
            </ul>
          </div>
        </div>

        {/* Trust Footer */}
        <div className="mt-12 text-center space-y-3">
          <div className="flex items-center justify-center gap-6 text-gray-400 text-sm flex-wrap">
            <span className="flex items-center gap-1.5">
              🔒 Secure checkout
            </span>
            <span className="flex items-center gap-1.5">
              ↩️ Cancel anytime
            </span>
            <span className="flex items-center gap-1.5">
              🎁 7-day free trial
            </span>
          </div>
          <p className="text-gray-400 text-xs">
            Powered by Stripe. Your payment info is never stored on our servers.
          </p>
        </div>
      </div>
    </div>
  )
}
