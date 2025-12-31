import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const transcriptId = req.nextUrl.searchParams.get('transcriptId')

  if (!transcriptId) {
    return NextResponse.json({ error: 'Missing transcriptId' }, { status: 400 })
  }

  try {
    const response = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
      headers: {
        'Authorization': process.env.ASSEMBLYAI_API_KEY!,
      },
    })

    const transcript = await response.json()
    return NextResponse.json(transcript, { status: 200 })
  } catch (error) {
    console.error('AssemblyAI fetch transcription error:', error)
    return NextResponse.json({ error: 'Failed to fetch transcription' }, { status: 500 })
  }
}
