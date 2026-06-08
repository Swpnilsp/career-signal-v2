import { NextRequest, NextResponse } from 'next/server';
import { parsePdf, parseDocx } from '@/utils/parser';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = file.name || 'resume.txt';
    const fileExtension = filename.split('.').pop()?.toLowerCase();

    let text = '';

    if (fileExtension === 'pdf') {
      text = await parsePdf(buffer);
    } else if (fileExtension === 'docx') {
      text = await parseDocx(buffer);
    } else if (fileExtension === 'txt') {
      text = buffer.toString('utf-8');
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a PDF, DOCX, or TXT file.' },
        { status: 400 }
      );
    }

    // Clean up empty lines or multiple spaces to reduce prompt sizes
    const cleanedText = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');

    return NextResponse.json({ text: cleanedText, filename });
  } catch (error: any) {
    console.error('Error parsing file in API route:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during file parsing.' },
      { status: 500 }
    );
  }
}
