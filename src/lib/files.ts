import fs from 'fs/promises';
import path from 'path';
import { getWorkspacePath, getMemoryDir } from './config';

export const CONFIG_FILES = [
  'MEMORY.md',
  'SOUL.md',
  'AGENTS.md',
  'HEARTBEAT.md',
  'USER.md',
  'IDENTITY.md',
  'TOOLS.md',
] as const;

export type ConfigFile = typeof CONFIG_FILES[number];

export interface FileContent {
  name: string;
  path: string;
  content: string;
  modifiedAt: Date;
}

export interface DailyNote {
  date: string;
  filename: string;
  path: string;
  content: string;
  modifiedAt: Date;
}

export async function readConfigFile(filename: ConfigFile): Promise<FileContent | null> {
  const workspacePath = await getWorkspacePath();
  const filePath = path.join(workspacePath, filename);
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const stats = await fs.stat(filePath);
    return {
      name: filename,
      path: filePath,
      content,
      modifiedAt: stats.mtime,
    };
  } catch {
    return null;
  }
}

export async function writeConfigFile(filename: ConfigFile, content: string): Promise<boolean> {
  const workspacePath = await getWorkspacePath();
  const filePath = path.join(workspacePath, filename);
  try {
    await fs.writeFile(filePath, content, 'utf-8');
    return true;
  } catch {
    return false;
  }
}

export async function readAllConfigFiles(): Promise<FileContent[]> {
  const files: FileContent[] = [];
  for (const filename of CONFIG_FILES) {
    const file = await readConfigFile(filename);
    if (file) files.push(file);
  }
  return files;
}

export async function getDailyNotes(): Promise<DailyNote[]> {
  try {
    const memoryDir = await getMemoryDir();
    const files = await fs.readdir(memoryDir);
    const mdFiles = files.filter(f => f.endsWith('.md')).sort().reverse();

    const notes: DailyNote[] = [];
    for (const filename of mdFiles) {
      const filePath = path.join(memoryDir, filename);
      const content = await fs.readFile(filePath, 'utf-8');
      const stats = await fs.stat(filePath);
      const date = filename.replace('.md', '');
      notes.push({
        date,
        filename,
        path: filePath,
        content,
        modifiedAt: stats.mtime,
      });
    }
    return notes;
  } catch {
    return [];
  }
}

export async function readDailyNote(date: string): Promise<DailyNote | null> {
  const memoryDir = await getMemoryDir();
  const filename = `${date}.md`;
  const filePath = path.join(memoryDir, filename);
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const stats = await fs.stat(filePath);
    return {
      date,
      filename,
      path: filePath,
      content,
      modifiedAt: stats.mtime,
    };
  } catch {
    return null;
  }
}

export async function writeDailyNote(date: string, content: string): Promise<boolean> {
  const memoryDir = await getMemoryDir();
  const filename = `${date}.md`;
  const filePath = path.join(memoryDir, filename);
  try {
    await fs.writeFile(filePath, content, 'utf-8');
    return true;
  } catch {
    return false;
  }
}

export async function appendToTodayNote(content: string): Promise<boolean> {
  const memoryDir = await getMemoryDir();
  const today = new Date().toISOString().split('T')[0];
  const filename = `${today}.md`;
  const filePath = path.join(memoryDir, filename);

  try {
    let existingContent = '';
    try {
      existingContent = await fs.readFile(filePath, 'utf-8');
    } catch {
      existingContent = `# Daily Notes - ${today}\n\n`;
    }

    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    const newContent = existingContent + `\n## ${timestamp}\n${content}\n`;
    await fs.writeFile(filePath, newContent, 'utf-8');
    return true;
  } catch {
    return false;
  }
}

export interface SearchResult {
  file: string;
  filename: string;
  matches: { line: number; content: string }[];
}

export async function searchAllFiles(query: string): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  const queryLower = query.toLowerCase();

  // Search config files
  for (const filename of CONFIG_FILES) {
    const file = await readConfigFile(filename);
    if (file) {
      const matches = findMatches(file.content, queryLower);
      if (matches.length > 0) {
        results.push({
          file: file.path,
          filename: file.name,
          matches,
        });
      }
    }
  }

  // Search daily notes
  const notes = await getDailyNotes();
  for (const note of notes) {
    const matches = findMatches(note.content, queryLower);
    if (matches.length > 0) {
      results.push({
        file: note.path,
        filename: note.filename,
        matches,
      });
    }
  }

  return results;
}

function findMatches(content: string, query: string): { line: number; content: string }[] {
  const lines = content.split('\n');
  const matches: { line: number; content: string }[] = [];

  lines.forEach((line, index) => {
    if (line.toLowerCase().includes(query)) {
      matches.push({
        line: index + 1,
        content: line.trim(),
      });
    }
  });

  return matches;
}
