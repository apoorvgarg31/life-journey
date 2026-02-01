import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { readAllConfigFiles, readConfigFile, writeConfigFile, CONFIG_FILES, type ConfigFile } from '@/lib/files';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const files = await readAllConfigFiles();
  return NextResponse.json({ files });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { filename, content } = await request.json();

    if (!CONFIG_FILES.includes(filename as ConfigFile)) {
      return NextResponse.json({ error: 'Invalid file' }, { status: 400 });
    }

    const success = await writeConfigFile(filename as ConfigFile, content);
    if (success) {
      const file = await readConfigFile(filename as ConfigFile);
      return NextResponse.json({ success: true, file });
    }
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
