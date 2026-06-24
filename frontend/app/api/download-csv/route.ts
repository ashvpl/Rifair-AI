import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'submission.csv');
    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="submission.csv"',
      },
    });
  } catch (error) {
    console.error('Error serving CSV:', error);
    return new NextResponse('File not found', { status: 404 });
  }
}
