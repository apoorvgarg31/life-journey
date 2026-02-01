import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDailyNotes, readDailyNote, writeDailyNote, appendToTodayNote } from '@/lib/files';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const date = request.nextUrl.searchParams.get('date');

  if (date) {
    const note = await readDailyNote(date);
    if (note) {
      return NextResponse.json({ note });
    }
    return NextResponse.json({ error: 'Note not found' }, { status: 404 });
  }

  const notes = await getDailyNotes();
  return NextResponse.json({ notes });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { date, content, append } = await request.json();

    if (append) {
      const success = await appendToTodayNote(content);
      if (success) {
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: 'Failed to append' }, { status: 500 });
    }

    if (!date || !content) {
      return NextResponse.json({ error: 'Date and content required' }, { status: 400 });
    }

    const success = await writeDailyNote(date, content);
    if (success) {
      const note = await readDailyNote(date);
      return NextResponse.json({ success: true, note });
    }
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
