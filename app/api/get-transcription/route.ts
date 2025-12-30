import { NextRequest, NextResponse } from 'next/server';
import { AssemblyAI } from 'assemblyai';

export async function GET(req: NextRequest) {
  const transcriptId = req.nextUrl.searchParams.get('transcriptId');

  if (!transcriptId) {
    return NextResponse.json({ error: 'Missing transcriptId' }, { status: 400 });
  }

  try {
    const client = new AssemblyAI({
      apiKey: process.env.ASSEMBLYAI_API_KEY as string,
    });

    const transcript = await client.transcripts.get(transcriptId as string);

    return NextResponse.json(transcript, { status: 200 });
  } catch (error) {
    console.error('AssemblyAI fetch transcription error:', error);
    return NextResponse.json({ error: 'Failed to fetch transcription' }, { status: 500 });
  }
}

