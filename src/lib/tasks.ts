import fs from 'fs/promises';
import path from 'path';
import { getTasksFile } from './config';

export type TaskStatus = 'planned' | 'in-progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TasksData {
  tasks: Task[];
}

async function ensureTasksFile(): Promise<string> {
  const tasksFile = await getTasksFile();
  const dir = path.dirname(tasksFile);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }

  try {
    await fs.access(tasksFile);
  } catch {
    await fs.writeFile(tasksFile, JSON.stringify({ tasks: [] }, null, 2));
  }

  return tasksFile;
}

export async function getTasks(): Promise<Task[]> {
  const tasksFile = await ensureTasksFile();
  try {
    const data = await fs.readFile(tasksFile, 'utf-8');
    const parsed: TasksData = JSON.parse(data);
    return parsed.tasks || [];
  } catch {
    return [];
  }
}

export async function saveTasks(tasks: Task[]): Promise<boolean> {
  const tasksFile = await ensureTasksFile();
  try {
    await fs.writeFile(tasksFile, JSON.stringify({ tasks }, null, 2));
    return true;
  } catch {
    return false;
  }
}

export async function createTask(title: string, description?: string): Promise<Task> {
  const tasks = await getTasks();
  const now = new Date().toISOString();
  const newTask: Task = {
    id: crypto.randomUUID(),
    title,
    description,
    status: 'planned',
    createdAt: now,
    updatedAt: now,
  };
  tasks.push(newTask);
  await saveTasks(tasks);
  return newTask;
}

export async function updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<Task | null> {
  const tasks = await getTasks();
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return null;

  tasks[index] = {
    ...tasks[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  await saveTasks(tasks);
  return tasks[index];
}

export async function deleteTask(id: string): Promise<boolean> {
  const tasks = await getTasks();
  const filtered = tasks.filter(t => t.id !== id);
  if (filtered.length === tasks.length) return false;
  await saveTasks(filtered);
  return true;
}
