import { NextRequest, NextResponse } from 'next/server'
import { AssemblyAI } from 'assemblyai'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const SYSTEM_PROMPT = `You are Studly, an AI study assistant specialized in creating exam-ready notes for IB, A-Level, and GCSE students. Your notes are structured, clear, and optimized for revision.

When given a lecture transcription, you must output valid JSON with this exact structure:
{
  "summary": "2-3 paragraph executive summary of the key points",
  "content": "Full structured notes in markdown format with headers, bullet points, and clear organization",
  "keyConcepts": ["Array", "of", "key", "terms", "and", "concepts"],
  "flashcards": [
    {"front": "Question or term", "back": "Answer or definition"}
  ],
  "examTips": ["Practical tips for exam questions on this topic"]
}

Guidelines:
- Use clear, concise language appropriate for students
- Structure notes with logical hierarchy (H2 for main topics, H3 for subtopics)
- Highlight definitions, formulas, and key facts
- Create 5-10 flashcards covering the most important concepts
- Create flashcards that test understanding, not just recall
- Include exam tips specific to the subject and exam board if known
- Output ONLY valid JSON, no markdown code blocks or additional text`

function getUserPrompt(transcription: string, subject?: string, examBoard?: string): string {
  let prompt = ''
  if (subject) prompt += `Subject: ${subject}\n`
  if (examBoard) prompt += `Exam Board: ${examBoard}\n`
  prompt += `\nLecture Transcription:\n${transcription}\n\nGenerate comprehensive study notes from this lecture. Output only valid JSON.`
  return prompt
}

async function generateNotes(
  transcriptionText: string,
  subject?: string,
  examBoard?: string
): Promise<{
  summary: string
  content: string
  keyConcepts: string[]
  flashcards: { front: string; back: string }[]
  examTips: string[]
}> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: getUserPrompt(transcriptionText, subject, examBoard) }
      ],
      temperature: 0.3,
      max_tokens: 4096,
      response_format: { type: 'json_object' }
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Groq API error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  const content = data.choices[0]?.message?.content

  if (!content) {
    throw new Error('No content received from Groq')
  }

  return JSON.parse(content)
}

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams
    const recordingId = searchParams.get('recordingId')

    if (!recordingId) {
      return NextResponse.json({ error: 'Missing recordingId' }, { status: 400 })
    }

    // Get the recording
    const { data: recording } = await supabase
      .from('recordings')
      .select('*')
      .eq('id', recordingId)
      .eq('user_id', session.user.id)
      .single()

    if (!recording) {
      return NextResponse.json({ error: 'Recording not found' }, { status: 404 })
    }

    // If already completed or failed, return that status
    if (recording.status === 'completed') {
      const { data: notes } = await supabase
        .from('study_notes')
        .select('*')
        .eq('recording_id', recordingId)
        .single()

      return NextResponse.json({
        status: 'completed',
        result: notes,
      })
    }

    if (recording.status === 'failed') {
      return NextResponse.json({
        status: 'failed',
        error: recording.error_message || 'Processing failed',
      })
    }

    // Get the processing job
    const { data: job } = await supabase
      .from('processing_jobs')
      .select('*')
      .eq('recording_id', recordingId)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!job) {
      return NextResponse.json({
        status: 'pending',
        message: 'No processing job found',
      })
    }

    // If job already completed or failed
    if (job.status === 'completed' && job.result_id) {
      const { data: notes } = await supabase
        .from('study_notes')
        .select('*')
        .eq('id', job.result_id)
        .single()

      return NextResponse.json({
        status: 'completed',
        result: notes,
      })
    }

    if (job.status === 'failed') {
      return NextResponse.json({
        status: 'failed',
        error: job.error || 'Processing failed',
      })
    }

    // Check transcription status if we have a transcript ID
    if (job.assemblyai_transcript_id && job.step === 'transcription') {
      try {
        // Initialize AssemblyAI inside function to avoid build-time errors
        const assemblyClient = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY! })
        const transcript = await assemblyClient.transcripts.get(job.assemblyai_transcript_id)

        if (transcript.status === 'error') {
          // Update job and recording as failed
          await supabase
            .from('processing_jobs')
            .update({
              status: 'failed',
              error: transcript.error || 'Transcription failed',
            })
            .eq('id', job.id)

          await supabase
            .from('recordings')
            .update({
              status: 'failed',
              error_message: transcript.error || 'Transcription failed',
            })
            .eq('id', recordingId)

          return NextResponse.json({
            status: 'failed',
            error: transcript.error || 'Transcription failed',
          })
        }

        if (transcript.status === 'completed' && transcript.text) {
          // Transcription complete - now generate notes
          await supabase
            .from('processing_jobs')
            .update({
              step: 'note_generation',
              status: 'processing',
            })
            .eq('id', job.id)

          try {
            // Generate notes using Groq
            const notes = await generateNotes(
              transcript.text,
              recording.subject,
              recording.exam_board
            )

            // Calculate word count from content
            const wordCount = notes.content ? notes.content.split(/\s+/).length : 0

            // Save study notes
            const { data: savedNotes, error: saveError } = await supabase
              .from('study_notes')
              .insert({
                recording_id: recordingId,
                user_id: session.user.id,
                title: recording.title || 'Untitled Notes',
                summary: notes.summary,
                content: notes.content,
                key_concepts: notes.keyConcepts,
                flashcards: notes.flashcards,
                exam_tips: notes.examTips,
                transcription_text: transcript.text,
                word_count: wordCount,
              })
              .select()
              .single()

            if (saveError) {
              throw new Error(`Failed to save notes: ${saveError.message}`)
            }

            // Update processing job as completed
            await supabase
              .from('processing_jobs')
              .update({
                step: 'completed',
                status: 'completed',
                result_id: savedNotes.id,
                completed_at: new Date().toISOString(),
              })
              .eq('id', job.id)

            // Update recording as completed
            await supabase
              .from('recordings')
              .update({ status: 'completed' })
              .eq('id', recordingId)

            // Update usage tracking - increment hours_used in subscription
            if (recording.duration) {
              const durationHours = recording.duration / 3600
              const { data: subscription } = await supabase
                .from('subscriptions')
                .select('hours_used')
                .eq('user_id', session.user.id)
                .single()

              if (subscription) {
                const newHoursUsed = (subscription.hours_used || 0) + durationHours
                await supabase
                  .from('subscriptions')
                  .update({ hours_used: newHoursUsed })
                  .eq('user_id', session.user.id)
              }
            }

            return NextResponse.json({
              status: 'completed',
              result: savedNotes,
            })
          } catch (genError) {
            console.error('Note generation error:', genError)

            await supabase
              .from('processing_jobs')
              .update({
                status: 'failed',
                error: genError instanceof Error ? genError.message : 'Note generation failed',
              })
              .eq('id', job.id)

            await supabase
              .from('recordings')
              .update({
                status: 'failed',
                error_message: 'Note generation failed',
              })
              .eq('id', recordingId)

            return NextResponse.json({
              status: 'failed',
              error: 'Failed to generate notes',
            })
          }
        }

        // Still processing transcription
        return NextResponse.json({
          status: 'processing',
          step: 'transcription',
          message: 'Transcribing audio...',
        })
      } catch (transcriptError) {
        console.error('Transcript fetch error:', transcriptError)
        return NextResponse.json({
          status: 'processing',
          step: 'transcription',
          message: 'Checking transcription status...',
        })
      }
    }

    // Default processing response
    return NextResponse.json({
      status: 'processing',
      step: job.step,
      message: 'Processing in progress...',
    })
  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
