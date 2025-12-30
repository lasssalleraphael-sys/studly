'use client'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Mic, FileText, Settings, CreditCard, Clock, CheckCircle, Loader, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import UsageDisplay from '@/components/UsageDisplay'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [recordings, setRecordings] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, completed: 0, processing: 0 })
  const [usage, setUsage] = useState({ planName: 'starter', planLimit: 7, used: 0, remaining: 7, canRecord: true })
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('session_id')) {
      alert('Welcome to Studly! Your subscription is now active.')
      window.history.replaceState({}, '', '/dashboard')
    }

    const loadData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          window.location.href = '/auth'
          return
        }
        setUser(session.user)

        const { data: sub } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', session.user.id)
          .single()
        setSubscription(sub)

        const { data: recs } = await supabase
          .from('recordings')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(5)
        
        if (recs) {
          setRecordings(recs)
          setStats({
            total: recs.length,
            completed: recs.filter(r => r.status === 'completed').length,
            processing: recs.filter(r => r.status === 'processing' || r.status === 'pending').length
          })
        }

        // Fetch usage from server-side API
        const usageRes = await fetch('/api/check-usage')
        if (usageRes.ok) {
          const usageData = await usageRes.json()
          setUsage(usageData)
        }

      } catch (error) {
        console.error('Error loading dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  const firstName = user?.email?.split('@')[0] || 'Student'

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome back, {firstName}!</h1>
          <p className="text-gray-600">Here is your revision overview</p>
        </div>

        {!usage.canRecord && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Monthly limit reached</p>
              <p className="text-sm text-red-700 mt-1">
                You have used all {usage.planLimit} recordings for this month. 
                <Link href="/pricing" className="underline ml-1">Upgrade your plan</Link> for more, or wait until the 1st when your limit resets.
              </p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {subscription && (
            <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl text-white shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">Current plan</p>
                  <h3 className="text-2xl font-bold capitalize">{subscription.plan_name}</h3>
                  <p className="text-blue-100 text-sm mt-1">
                    Active until {new Date(subscription.current_period_end).toLocaleDateString()}
                  </p>
                </div>
                <Link href="/settings" className="px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold rounded-lg transition-colors">
                  Manage plan
                </Link>
              </div>
            </div>
          )}
          <UsageDisplay planName={usage.planName} lecturesUsed={usage.used} lecturesLimit={usage.planLimit} />
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <p className="text-sm text-gray-600">Total recordings</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.completed}</div>
            </div>
            <p className="text-sm text-gray-600">Notes ready</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.processing}</div>
            </div>
            <p className="text-sm text-gray-600">Processing</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick actions</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {!usage.canRecord ? (
              <div className="bg-gray-100 border border-gray-200 rounded-xl p-6 opacity-60 cursor-not-allowed">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                  <Mic className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-500 mb-1">Record lecture</h3>
                <p className="text-sm text-gray-400">Limit reached</p>
              </div>
            ) : (
              <Link href="/record" className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-600 hover:shadow-sm transition-all">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                  <Mic className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Record lecture</h3>
                <p className="text-sm text-gray-600">Start a new recording</p>
              </Link>
            )}
            <Link href="/notes" className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-600 hover:shadow-sm transition-all">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors">
                <FileText className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">My notes</h3>
              <p className="text-sm text-gray-600">View all study notes</p>
            </Link>
            <Link href="/settings" className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-600 hover:shadow-sm transition-all">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-gray-600 transition-colors">
                <Settings className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Settings</h3>
              <p className="text-sm text-gray-600">Account and preferences</p>
            </Link>
            <Link href="/pricing" className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-600 hover:shadow-sm transition-all">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-600 transition-colors">
                <CreditCard className="w-6 h-6 text-green-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Upgrade</h3>
              <p className="text-sm text-gray-600">View all plans</p>
            </Link>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent recordings</h2>
            <Link href="/notes" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View all</Link>
          </div>
          {recordings.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">No recordings yet</h3>
              <p className="text-gray-600 mb-6">Start by recording your first lecture</p>
              {usage.canRecord && (
                <Link href="/record" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                  <Mic className="w-5 h-5" />
                  Record now
                </Link>
              )}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="divide-y divide-gray-200">
                {recordings.map((recording) => (
                  <div key={recording.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{recording.title || 'Untitled Recording'}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{new Date(recording.created_at).toLocaleDateString()}</span>
                          {recording.duration && <span>{Math.round(recording.duration / 60)} min</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={'px-3 py-1 rounded-full text-xs font-medium ' + (recording.status === 'completed' ? 'bg-green-100 text-green-700' : recording.status === 'processing' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700')}>
                          {recording.status}
                        </span>
                        {recording.status === 'completed' && (
                          <Link href={'/notes/' + recording.id} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                            View notes
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
