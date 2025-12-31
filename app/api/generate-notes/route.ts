import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { transcriptionText } = await req.json()

  if (!transcriptionText) {
    return NextResponse.json({ error: 'Missing transcription text' }, { status: 400 })
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a study assistant. Generate structured notes from lecture transcriptions. Return JSON with keys: summary (string), mainPoints (array of strings), actionItems (array of strings), flashcards (array of {front, back} objects).'
          },
          {
            role: 'user',
            content: `Generate study notes from this transcription:\n\n${transcriptionText}`
          }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      }),
    })

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error('No content received from Groq')
    }

    const parsedContent = JSON.parse(content)
    return NextResponse.json(parsedContent, { status: 200 })
  } catch (error) {
    console.error('Groq API error:', error)
    return NextResponse.json({ error: 'Failed to generate notes' }, { status: 500 })
  }
}
