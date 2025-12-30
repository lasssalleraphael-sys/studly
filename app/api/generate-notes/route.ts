import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  const { transcriptionText } = await req.json();

  if (!transcriptionText) {
    return NextResponse.json({ error: 'Missing transcription text' }, { status: 400 });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});

    const prompt = `Given the following transcription, generate a concise summary, a list of main points, and a list of action items. Format the output as a JSON object with the keys 'summary' (string), 'mainPoints' (array of strings), and 'actionItems' (array of strings). Do not include any other text or formatting outside the JSON object.\n\nTranscription:\n\n${transcriptionText}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const content = response.text();

    if (!content) {
      throw new Error('No content received from Google Gemini');
    }

    // Attempt to parse the content as JSON
    const parsedContent = JSON.parse(content);

    return NextResponse.json(parsedContent, { status: 200 });
  } catch (error) {
    console.error('Google Gemini API error:', error);
    return NextResponse.json({ error: 'Failed to generate notes' }, { status: 500 });
  }
}

