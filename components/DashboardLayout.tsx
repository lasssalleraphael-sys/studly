'use client'

import { useEffect, useState, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Sidebar from './Sidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const supabase = useMemo(() => {
    if (typeof window === 'undefined') return null
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }, [])

  useEffect(() => {
    if (!supabase) return

    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setUser(session.user)

        const { data: sub } = await supabase
          .from('subscriptions')
          .select('plan_name, status')
          .eq('user_id', session.user.id)
          .single()

        setSubscription(sub)
      }
      setLoading(false)
    }

    loadUser()

    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user || null)
        if (session) {
          const { data: sub } = await supabase
            .from('subscriptions')
            .select('plan_name, status')
            .eq('user_id', session.user.id)
            .single()
          setSubscription(sub)
        }
      }
    )

    return () => {
      authSub.unsubscribe()
    }
  }, [supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar user={user} subscription={subscription} />
      <main className="pl-64 min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
