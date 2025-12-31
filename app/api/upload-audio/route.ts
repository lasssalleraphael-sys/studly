import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
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

    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    const duration = parseInt(formData.get('duration') as string) || 0

    if (!audioFile) {
      return NextResponse.json({ error: 'Missing audio file' }, { status: 400 })
    }

    const timestamp = Date.now()
    const filename = `${session.user.id}/${timestamp}.webm`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('recordings')
      .upload(filename, audioFile, {
        contentType: 'audio/webm',
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload audio' }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage
      .from('recordings')
      .getPublicUrl(filename)

    const { data: recording, error: dbError } = await supabase
      .from('recordings')
      .insert({
        user_id: session.user.id,
        audio_url: publicUrl,
        filename: filename,
        duration: duration,
        status: 'uploaded',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Failed to save recording' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      recordingId: recording.id,
      audioUrl: publicUrl,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
