// app/api/upload-audio/route.ts
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    const title = formData.get('title') as string || 'Untitled Recording'

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
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

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const timestamp = Date.now()
    const filename = `${user.id}/${timestamp}.webm`

    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('recordings')
      .upload(filename, buffer, {
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
        user_id: user.id,
        title: title,
        audio_url: publicUrl,
        filename: filename,
        file_size: audioFile.size,
        status: 'uploaded',
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Failed to save recording' }, { status: 500 })
    }

    console.log('Recording uploaded:', recording.id)

    return NextResponse.json({
      success: true,
      recordingId: recording.id,
      audioUrl: publicUrl,
    })

  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
