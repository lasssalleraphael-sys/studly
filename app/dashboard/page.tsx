'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Mic, FileText, Settings, CreditCard, Clock, CheckCircle, AlertCircle, Sparkles, TrendingUp, Play } from 'lucide-react'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import { SkeletonDashboard } from '@/components/Skeleton'

interface Recording {
  id: string
  title: string
  status: string
  duration: number | null
  created_at: string
  subject?: string
  exam_board?: string
}

interface Usage {
  planName: string
  planLimit: number
  used: number
  remaining: number
  canRecord: boolean
}

export default function DashboardPage() {
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [stats, setStats] = useState({ total: 0, completed: 0, processing: 0 })
  const [usage, setUsage] = useState<Usage>({ planName: 'starter', planLimit: 5, used: 0, remaining: 5, canRecord: true })
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)

  const supabase = useMemo(() => {
    if (typeof window === 'undefined') return null
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }, [])

  const loadRecordings = useCallback(async (userId: string) => {
    if (!supabase) return
    const { data: recs } = await supabase
      .from('recordings')
      .select('*')
      .eq('user_id', userId)
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
  }, [supabase])

  useEffect(() => {
    if (!supabase) return
    // Handle Stripe success redirect
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('session_id')) {
      window.history.replaceState({}, '', '/dashboard')
    }

    const loadData = async () => {
      try {
        const { data: { session: sess } } = await supabase.auth.getSession()
        if (!sess) {
          window.location.href = '/auth'
          return
        }
        setSession(sess)

        await loadRecordings(sess.user.id)

        // Fetch usage
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
  }, [supabase, loadRecordings])

  // Supabase Realtime subscription for instant updates
  useEffect(() => {
    if (!session?.user?.id || !supabase) return

    const channel = supabase
      .channel('dashboard-recordings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'recordings',
          filter: `user_id=eq.${session.user.id}`
        },
        (payload) => {
          console.log('Realtime update:', payload)

          if (payload.eventType === 'INSERT') {
            setRecordings(prev => [payload.new as Recording, ...prev.slice(0, 4)])
            setStats(prev => ({
              ...prev,
              total: prev.total + 1,
              processing: prev.processing + 1
            }))
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Recording
            setRecordings(prev =>
              prev.map(r => r.id === updated.id ? updated : r)
            )
            // Recalculate stats
            setRecordings(prev => {
              setStats({
                total: prev.length,
                completed: prev.filter(r => r.status === 'completed').length,
                processing: prev.filter(r => r.status === 'processing' || r.status === 'pending').length
              })
              return prev
            })
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as Recording).id
            setRecordings(prev => prev.filter(r => r.id !== deletedId))
            setStats(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session, supabase])

  if (loading) {
    return (
      <DashboardLayout>
        <SkeletonDashboard />
      </DashboardLayout>
    )
  }

  const firstName = session?.user?.email?.split('@')[0] || 'Student'
  const usagePercentage = usage.planLimit > 0 ? (usage.used / usage.planLimit) * 100 : 0

  return (
    <DashboardLayout>
      <div className="space-y-8 fade-in">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, <span className="text-gradient">{firstName}</span>!
          </h1>
          <p className="text-slate-400">Here's your revision overview</p>
        </div>

        {/* Limit Warning */}
        {!usage.canRecord && (
          <div className="glass-card p-4 border-red-500/50 bg-red-500/10">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-300">Monthly limit reached</p>
                <p className="text-sm text-red-400/80 mt-1">
                  You've used all {usage.planLimit} hours this month.{' '}
                  <Link href="/pricing" className="text-violet-400 hover:text-violet-300 underline">
                    Upgrade your plan
                  </Link>{' '}
                  for more hours.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-violet-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.total}</div>
            <p className="text-sm text-slate-400">Total recordings</p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.completed}</div>
            <p className="text-sm text-slate-400">Notes ready</p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.processing}</div>
            <p className="text-sm text-slate-400">Processing</p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{usage.remaining}h</div>
            <p className="text-sm text-slate-400">Hours remaining</p>
          </div>
        </div>

        {/* Usage Progress */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white capitalize">{usage.planName} Plan</h3>
                <p className="text-sm text-slate-400">Monthly usage</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">Used</p>
              <p className="text-lg font-bold text-white">{usage.used}h / {usage.planLimit}h</p>
            </div>
          </div>
          <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {usage.remaining} hours remaining this billing period
          </p>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Quick actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {!usage.canRecord ? (
              <div className="glass-card p-6 opacity-50 cursor-not-allowed">
                <div className="w-12 h-12 bg-slate-700/50 rounded-xl flex items-center justify-center mb-4">
                  <Mic className="w-6 h-6 text-slate-500" />
                </div>
                <h3 className="font-semibold text-slate-500 mb-1">Record lecture</h3>
                <p className="text-sm text-slate-600">Limit reached</p>
              </div>
            ) : (
              <Link href="/record" className="glass-card p-6 group hover:border-violet-500/50 transition-all">
                <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-violet-500/30 transition-colors">
                  <Mic className="w-6 h-6 text-violet-400" />
                </div>
                <h3 className="font-semibold text-white mb-1 group-hover:text-violet-300 transition-colors">Record lecture</h3>
                <p className="text-sm text-slate-400">Start a new recording</p>
              </Link>
            )}

            <Link href="/notes" className="glass-card p-6 group hover:border-violet-500/50 transition-all">
              <div className="w-12 h-12 bg-fuchsia-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-fuchsia-500/30 transition-colors">
                <FileText className="w-6 h-6 text-fuchsia-400" />
              </div>
              <h3 className="font-semibold text-white mb-1 group-hover:text-fuchsia-300 transition-colors">My notes</h3>
              <p className="text-sm text-slate-400">View all study notes</p>
            </Link>

            <Link href="/settings" className="glass-card p-6 group hover:border-violet-500/50 transition-all">
              <div className="w-12 h-12 bg-slate-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-slate-500/30 transition-colors">
                <Settings className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="font-semibold text-white mb-1 group-hover:text-slate-300 transition-colors">Settings</h3>
              <p className="text-sm text-slate-400">Account preferences</p>
            </Link>

            <Link href="/pricing" className="glass-card p-6 group hover:border-violet-500/50 transition-all">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-500/30 transition-colors">
                <CreditCard className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="font-semibold text-white mb-1 group-hover:text-emerald-300 transition-colors">Upgrade</h3>
              <p className="text-sm text-slate-400">View all plans</p>
            </Link>
          </div>
        </div>

        {/* Recent Recordings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Recent recordings</h2>
            <Link href="/notes" className="text-sm text-violet-400 hover:text-violet-300 font-medium transition-colors">
              View all
            </Link>
          </div>

          {recordings.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="font-semibold text-white mb-2">No recordings yet</h3>
              <p className="text-slate-400 mb-6">Start by recording your first lecture</p>
              {usage.canRecord && (
                <Link href="/record" className="btn-primary inline-flex items-center gap-2">
                  <Mic className="w-5 h-5" />
                  Record now
                </Link>
              )}
            </div>
          ) : (
            <div className="glass-card overflow-hidden">
              <div className="divide-y divide-slate-700/50">
                {recordings.map((recording) => (
                  <div key={recording.id} className="p-5 hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">
                          {recording.title || 'Untitled Recording'}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-slate-400">
                          <span>{new Date(recording.created_at).toLocaleDateString()}</span>
                          {recording.duration && (
                            <span>{Math.round(recording.duration / 60)} min</span>
                          )}
                          {recording.subject && (
                            <span className="text-violet-400">{recording.subject}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          recording.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : recording.status === 'processing'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                            : recording.status === 'failed'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                        }`}>
                          {recording.status === 'processing' && (
                            <span className="inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                              Processing
                            </span>
                          )}
                          {recording.status !== 'processing' && recording.status}
                        </span>
                        {recording.status === 'completed' && (
                          <Link
                            href={`/notes/${recording.id}`}
                            className="btn-primary text-sm py-2 px-4 inline-flex items-center gap-2"
                          >
                            <Play className="w-4 h-4" />
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
    </DashboardLayout>
  )
}
