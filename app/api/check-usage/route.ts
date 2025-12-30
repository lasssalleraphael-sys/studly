import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const PLAN_LIMITS: Record<string, number> = {
  starter: 7,
  pro: 18,
  elite: 37,
  basic: 7,
}

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's subscription plan
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_name')
      .eq('user_id', session.user.id)
      .single()

    const planName = subscription?.plan_name || 'starter'
    const planLimit = PLAN_LIMITS[planName.toLowerCase()] || 7

    // Count recordings this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count } = await supabase
      .from('recordings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .gte('created_at', startOfMonth.toISOString())

    const used = count || 0
    const remaining = Math.max(0, planLimit - used)
    const canRecord = used < planLimit

    return NextResponse.json({
      planName,
      planLimit,
      used,
      remaining,
      canRecord,
    })
  } catch (error: any) {
    console.error('Usage check error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
