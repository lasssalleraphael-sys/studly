import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { recordingId } = await request.json()
    
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

    return NextResponse.json({ success: true, message: 'Processing started' })
  } catch (error: any) {
    console.error('Processing error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
