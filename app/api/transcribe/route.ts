import { NextRequest, NextResponse } from 'next/server'
import { AssemblyAI } from 'assemblyai'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Initialize AssemblyAI inside function to avoid build-time errors
    const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY! })

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options as Record<string, unknown>)
              )
            } catch {
              // Ignore - cookies can only be modified in Server Actions or Route Handlers
            }
          },
        },
      }
    )

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { audioUrl, recordingId } = await request.json()

    if (!audioUrl) {
      return NextResponse.json({ error: 'Missing audioUrl' }, { status: 400 })
    }

    if (!recordingId) {
      return NextResponse.json({ error: 'Missing recordingId' }, { status: 400 })
    }

    // Submit the audio for transcription
    const transcript = await client.transcripts.transcribe({
      audio_url: audioUrl,
    })

    if (transcript.status === 'error') {
      console.error('AssemblyAI transcription error:', transcript.error)
      return NextResponse.json({
        error: 'Transcription failed',
        details: transcript.error
      }, { status: 500 })
    }

    return NextResponse.json({
      transcriptId: transcript.id,
      status: transcript.status,
    })
  } catch (error) {
    console.error('Transcription submission error:', error)
    return NextResponse.json({ error: 'Failed to submit transcription' }, { status: 500 })
  }
}
