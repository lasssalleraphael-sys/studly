import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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
          setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore
            }
          },
        },
      }
    )

    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_name, status')
      .eq('user_id', session.user.id)
      .in('status', ['active', 'trialing'])
      .single()

    if (!subscription) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 403 })
    }

    // Get usage for current month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count } = await supabase
      .from('recordings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .gte('created_at', startOfMonth.toISOString())

    // Plan limits (in hours)
    const planLimits: Record<string, number> = {
      starter: 7,
      pro: 18,
      elite: 37
    }

    const limit = planLimits[subscription.plan_name.toLowerCase()] || 7
    const used = count || 0

    return NextResponse.json({
      used,
      limit,
      remaining: Math.max(0, limit - used),
      plan: subscription.plan_name
    })
  } catch (error: any) {
    console.error('Check usage error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
