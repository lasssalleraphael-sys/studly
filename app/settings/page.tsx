'use client'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { User, CreditCard, LogOut, Loader, AlertCircle, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
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
  }, [])

  const handleLogout = async () => {
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
      alert('Failed to open subscription management. Please try again.')
    } finally {
      setPortalLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Settings</h1>

        {/* Account Information */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Account Information</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">Email</label>
              <p className="text-gray-900 mt-1">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">User ID</label>
              <p className="text-gray-600 text-sm mt-1 font-mono">{user?.id}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Member since</label>
              <p className="text-gray-900 mt-1">
                {new Date(user?.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Subscription Details */}
        {subscription && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Subscription</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Current Plan</p>
                  <p className="text-2xl font-bold text-gray-900 capitalize mt-1">
                    {subscription.plan_name}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  subscription.status === 'active' 
                    ? 'bg-green-100 text-green-700'
                    : subscription.status === 'past_due'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {subscription.status}
                </span>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700">Billing Period</p>
                <p className="text-gray-900 mt-1">
                  {new Date(subscription.current_period_start).toLocaleDateString()} - {new Date(subscription.current_period_end).toLocaleDateString()}
                </p>
              </div>

              {subscription.cancel_at_period_end && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-yellow-900">Subscription Ending</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Your subscription will end on {new Date(subscription.current_period_end).toLocaleDateString()}. 
                      You can reactivate it from the subscription management portal.
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-4 space-y-3">
                <button
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                  className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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
                  className="w-full py-3 bg-gray-100 text-gray-900 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Change Plan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* No Subscription */}
        {!subscription && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Subscription</h2>
            </div>
            <p className="text-gray-600 mb-4">You don't have an active subscription.</p>
            <button
              onClick={() => router.push('/pricing')}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Plans
            </button>
          </div>
        )}

        {/* Danger Zone */}
        <div className="bg-white border border-red-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Danger Zone</h2>
          <p className="text-gray-600 text-sm mb-4">
            Signing out will end your current session. You can sign back in at any time.
          </p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}