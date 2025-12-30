import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const PLAN_LIMITS: Record<string, number> = {
  starter: 7,
  pro: 18,
  elite: 37,
  basic: 7,
}

export async function POST(request: Request) {
  try {
    const { recordingId } = await request.json()
    
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

    // SERVER-SIDE LIMIT CHECK - Critical security enforcement
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_name')
      .eq('user_id', session.user.id)
      .single()

    const planName = subscription?.plan_name || 'starter'
    const planLimit = PLAN_LIMITS[planName.toLowerCase()] || 7

    // Count recordings this month (excluding the current one being processed)
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count } = await supabase
      .from('recordings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .gte('created_at', startOfMonth.toISOString())
      .neq('id', recordingId) // Exclude current recording

    const currentUsage = count || 0

    if (currentUsage >= planLimit) {
      // Delete the recording that was just uploaded since user is over limit
      await supabase
        .from('recordings')
        .delete()
        .eq('id', recordingId)
        .eq('user_id', session.user.id)

      return NextResponse.json({ 
        error: 'Monthly recording limit reached. Please upgrade your plan.',
        limitReached: true,
        planName,
        planLimit,
        currentUsage 
      }, { status: 403 })
    }

    const { data: recording } = await supabase
      .from('recordings')
      .select('*')
      .eq('id', recordingId)
      .single()

    if (!recording) {
      return NextResponse.json({ error: 'Recording not found' }, { status: 404 })
    }

    await supabase
      .from('recordings')
      .update({ status: 'processing' })
      .eq('id', recordingId)

    await supabase.from('processing_jobs').insert({
      recording_id: recordingId,
      user_id: session.user.id,
      step: 'transcription',
      status: 'pending',
    })

    console.log('Processing started for recording:', recordingId)

    return NextResponse.json({ 
      success: true, 
      message: 'Processing started',
      usage: {
        used: currentUsage + 1,
        limit: planLimit,
        remaining: planLimit - currentUsage - 1
      }
    })
  } catch (error: any) {
    console.error('Processing error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
