'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { User, CreditCard, LogOut, Loader, AlertCircle, ExternalLink, Sparkles, Calendar, Mail, Shield } from 'lucide-react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const router = useRouter()

  const supabase = useMemo(() => {
    if (typeof window === 'undefined') return null
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }, [])

  useEffect(() => {
    if (!supabase) return
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth')
        return
      }
      setUser(session.user)

      const { data: sub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .single()
      setSubscription(sub)
      setLoading(false)
    }
    loadData()
  }, [supabase, router])

  const handleLogout = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleManageSubscription = async () => {
    setPortalLoading(true)
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error('Failed to create portal session')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Portal error:', error)
    } finally {
      setPortalLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto fade-in">
        <h1 className="text-4xl font-bold text-white mb-8">
          <span className="text-gradient">Settings</span>
        </h1>

        {/* Account Information */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-violet-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Account Information</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Mail className="w-4 h-4" />
                Email
              </div>
              <p className="text-white font-medium">{user?.email}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Calendar className="w-4 h-4" />
                Member since
              </div>
              <p className="text-white font-medium">
                {new Date(user?.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="space-y-1 md:col-span-2">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Shield className="w-4 h-4" />
                User ID
              </div>
              <p className="text-slate-400 text-sm font-mono bg-slate-800/50 px-3 py-2 rounded-lg inline-block">
                {user?.id}
              </p>
            </div>
          </div>
        </div>

        {/* Subscription Details */}
        {subscription && (
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-fuchsia-500/20 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-fuchsia-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Subscription</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Current Plan</p>
                  <div className="flex items-center gap-3">
                    <p className="text-2xl font-bold text-white capitalize">
                      {subscription.plan_name}
                    </p>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      subscription.status === 'active' || subscription.status === 'trialing'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : subscription.status === 'past_due'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {subscription.status}
                    </span>
                  </div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Billing Period</p>
                  <p className="text-white">
                    {new Date(subscription.current_period_start).toLocaleDateString()} - {new Date(subscription.current_period_end).toLocaleDateString()}
                  </p>
                </div>
                {subscription.monthly_hours_limit && (
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Monthly Hours</p>
                    <p className="text-white">
                      {subscription.hours_used || 0}h / {subscription.monthly_hours_limit}h used
                    </p>
                  </div>
                )}
              </div>

              {subscription.cancel_at_period_end && (
                <div className="p-4 glass-card border-amber-500/30 bg-amber-500/5 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-300">Subscription Ending</p>
                    <p className="text-sm text-amber-200/80 mt-1">
                      Your subscription will end on {new Date(subscription.current_period_end).toLocaleDateString()}.
                      You can reactivate it from the subscription management portal.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-3">
                <button
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                  className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {portalLoading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-5 h-5" />
                      Manage Subscription
                    </>
                  )}
                </button>
                <button
                  onClick={() => router.push('/pricing')}
                  className="px-6 py-3 bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-600 transition-colors"
                >
                  Change Plan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* No Subscription */}
        {!subscription && (
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-fuchsia-500/20 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-fuchsia-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Subscription</h2>
            </div>
            <p className="text-slate-400 mb-4">You don't have an active subscription.</p>
            <button
              onClick={() => router.push('/pricing')}
              className="btn-primary"
            >
              View Plans
            </button>
          </div>
        )}

        {/* Danger Zone */}
        <div className="glass-card p-6 border-red-500/20">
          <h2 className="text-xl font-bold text-white mb-4">Danger Zone</h2>
          <p className="text-slate-400 text-sm mb-4">
            Signing out will end your current session. You can sign back in at any time.
          </p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 bg-red-500/20 text-red-400 font-semibold rounded-xl hover:bg-red-500/30 transition-colors border border-red-500/30"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}
