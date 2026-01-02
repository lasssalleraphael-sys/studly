import { NextRequest, NextResponse } from 'next/server'
import { AssemblyAI } from 'assemblyai'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Initialize AssemblyAI inside function to avoid build-time errors
    const assemblyClient = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY! })

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
              // Ignore - cookies can only be set in Server Components
            }
          },
        },
      }
    )

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { recordingId } = await request.json()

    if (!recordingId) {
      return NextResponse.json({ error: 'Missing recordingId' }, { status: 400 })
    }

    // Get the recording details
    const { data: recording, error: recordingError } = await supabase
      .from('recordings')
      .select('*')
      .eq('id', recordingId)
      .eq('user_id', session.user.id)
      .single()

    if (recordingError || !recording) {
      return NextResponse.json({ error: 'Recording not found' }, { status: 404 })
    }

    // Get the signed URL for the audio file from Supabase storage
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('recordings')
      .createSignedUrl(recording.audio_url, 3600) // 1 hour expiry

    if (signedUrlError || !signedUrlData) {
      console.error('Failed to get signed URL:', signedUrlError)
      return NextResponse.json({ error: 'Failed to access audio file' }, { status: 500 })
    }

    const audioUrl = signedUrlData.signedUrl

    // Update recording status to processing
    await supabase
      .from('recordings')
      .update({ status: 'processing' })
      .eq('id', recordingId)

    // Create processing job
    const { data: job, error: jobError } = await supabase
      .from('processing_jobs')
      .insert({
        recording_id: recordingId,
        user_id: session.user.id,
        step: 'transcription',
        status: 'processing',
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (jobError || !job) {
      console.error('Failed to create processing job:', jobError)
      return NextResponse.json({ error: 'Failed to create processing job' }, { status: 500 })
    }

    // Submit to AssemblyAI for transcription
    try {
      const transcript = await assemblyClient.transcripts.submit({
        audio_url: audioUrl,
      })

      // Store the transcript ID in the job
      await supabase
        .from('processing_jobs')
        .update({
          assemblyai_transcript_id: transcript.id,
        })
        .eq('id', job.id)

      return NextResponse.json({
        success: true,
        jobId: job.id,
        transcriptId: transcript.id,
        message: 'Processing started',
      })
    } catch (transcriptError) {
      console.error('AssemblyAI submission error:', transcriptError)

      // Update job to failed
      await supabase
        .from('processing_jobs')
        .update({
          status: 'failed',
          error: 'Failed to submit audio for transcription',
        })
        .eq('id', job.id)

      await supabase
        .from('recordings')
        .update({ status: 'failed', error_message: 'Transcription submission failed' })
        .eq('id', recordingId)

      return NextResponse.json({ error: 'Failed to start transcription' }, { status: 500 })
    }
  } catch (error) {
    console.error('Processing error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
