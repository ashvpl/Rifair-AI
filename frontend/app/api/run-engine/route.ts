import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST() {
  // Simulate the ~2.5s execution time for the Candidate Intelligence Engine
  await new Promise(resolve => setTimeout(resolve, 2500));

  try {
    const dataPath = path.join(process.cwd(), 'lib/demo-real-data.json');
    const fileContent = fs.readFileSync(dataPath, 'utf-8');
    const candidates = JSON.parse(fileContent);

    return NextResponse.json({
      success: true,
      message: 'Processed 100,000 candidates',
      data: candidates
    });
  } catch (err) {
    console.error('Failed to load demo-real-data.json:', err);
    return NextResponse.json({ error: 'Failed to run engine' }, { status: 500 });
  }
}
