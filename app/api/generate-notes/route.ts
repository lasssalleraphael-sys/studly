import { NextRequest, NextResponse } from 'next/server'
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

    const { transcriptionText, subject, examBoard } = await request.json()

    if (!transcriptionText) {
      return NextResponse.json({ error: 'Missing transcription text' }, { status: 400 })
    }

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
      console.error('Groq API error:', response.status, errorText)
      return NextResponse.json({ error: 'Failed to generate notes' }, { status: 500 })
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      return NextResponse.json({ error: 'No content received from AI' }, { status: 500 })
    }

    try {
      const parsedContent = JSON.parse(content)
      return NextResponse.json(parsedContent)
    } catch {
      console.error('Failed to parse AI response:', content)
      return NextResponse.json({ error: 'Invalid response format' }, { status: 500 })
    }
  } catch (error) {
    console.error('Generate notes error:', error)
    return NextResponse.json({ error: 'Failed to generate notes' }, { status: 500 })
  }
}
