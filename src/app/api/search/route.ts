import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { searchAllFiles } from '@/lib/files';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const query = request.nextUrl.searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json({ error: 'Query too short' }, { status: 400 });
  }

  const results = await searchAllFiles(query);
  return NextResponse.json({ results });
}
