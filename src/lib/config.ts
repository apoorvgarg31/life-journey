import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export interface LifeJourneyConfig {
  workspacePath: string;
  port: number;
  theme: 'dark' | 'light';
  auth: {
    username: string;
    passwordHash: string;
  };
  jwtSecret: string;
}

const CONFIG_DIR = path.join(os.homedir(), '.config', 'life-journey');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

const DEFAULT_CONFIG: Partial<LifeJourneyConfig> = {
  port: 7000,
  theme: 'dark',
};

let cachedConfig: LifeJourneyConfig | null = null;

export async function ensureConfigDir(): Promise<void> {
  try {
    await fs.access(CONFIG_DIR);
  } catch {
    await fs.mkdir(CONFIG_DIR, { recursive: true });
  }
}

export async function configExists(): Promise<boolean> {
  try {
    await fs.access(CONFIG_FILE);
    return true;
  } catch {
    return false;
  }
}

export async function getConfig(): Promise<LifeJourneyConfig> {
  if (cachedConfig) return cachedConfig;

  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf-8');
    cachedConfig = JSON.parse(data) as LifeJourneyConfig;
    return cachedConfig;
  } catch {
    throw new Error(
      'Config not found. Run "npx @apoorvgarg/life-journey setup" first.'
    );
  }
}

export async function saveConfig(config: LifeJourneyConfig): Promise<void> {
  await ensureConfigDir();
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
  cachedConfig = config;
}

export async function getWorkspacePath(): Promise<string> {
  const config = await getConfig();
  return config.workspacePath;
}

export async function getMemoryDir(): Promise<string> {
  const workspace = await getWorkspacePath();
  return path.join(workspace, 'memory');
}

export async function getTasksFile(): Promise<string> {
  const workspace = await getWorkspacePath();
  return path.join(workspace, '.clawdhub', 'tasks.json');
}

export function getConfigPath(): string {
  return CONFIG_FILE;
}

export function getDefaultConfig(): Partial<LifeJourneyConfig> {
  return { ...DEFAULT_CONFIG };
}

// Simple hash function for passwords (not cryptographically secure, but fine for local use)
export function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  // Add some salt-like mixing
  const mixed = (hash >>> 0).toString(16) + password.length.toString(16);
  return Buffer.from(mixed).toString('base64');
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// Generate a random JWT secret
export function generateJwtSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
