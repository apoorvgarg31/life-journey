import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getTasks, createTask, updateTask, deleteTask, type TaskStatus } from '@/lib/tasks';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tasks = await getTasks();
  return NextResponse.json({ tasks });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, description } = await request.json();

    if (!title) {
      return NextResponse.json({ error: 'Title required' }, { status: 400 });
    }

    const task = await createTask(title, description);
    return NextResponse.json({ task });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, title, description, status } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
    }

    const updates: { title?: string; description?: string; status?: TaskStatus } = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;

    const task = await updateTask(id, updates);
    if (task) {
      return NextResponse.json({ task });
    }
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
    }

    const success = await deleteTask(id);
    if (success) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
