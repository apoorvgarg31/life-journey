import * as readline from 'readline';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

interface Config {
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

function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const mixed = (hash >>> 0).toString(16) + password.length.toString(16);
  return Buffer.from(mixed).toString('base64');
}

function generateJwtSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function createReadlineInterface(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function ask(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function detectWorkspace(): Promise<string | null> {
  // Check common locations for MEMORY.md
  const candidates = [
    path.join(os.homedir(), 'clawd'),
    path.join(os.homedir(), '.clawd'),
    path.join(os.homedir(), 'agent'),
    process.cwd(),
  ];

  for (const candidate of candidates) {
    try {
      await fs.access(path.join(candidate, 'MEMORY.md'));
      return candidate;
    } catch {
      // Continue searching
    }
  }
  return null;
}

async function validateWorkspace(workspacePath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(workspacePath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

export async function setup(): Promise<void> {
  console.log('\n🚀 Life Journey Setup\n');

  const rl = createReadlineInterface();

  try {
    // Detect workspace
    const detected = await detectWorkspace();
    let workspacePath: string;

    if (detected) {
      console.log(`📂 Auto-detected workspace: ${detected} (has MEMORY.md)`);
      const useDetected = await ask(rl, 'Use this workspace? (Y/n): ');
      if (useDetected.toLowerCase() === 'n') {
        workspacePath = await ask(rl, 'Enter workspace path: ');
      } else {
        workspacePath = detected;
      }
    } else {
      console.log('📂 No workspace auto-detected.');
      workspacePath = await ask(rl, 'Enter your agent workspace path: ');
    }

    // Expand ~ to home directory
    if (workspacePath.startsWith('~')) {
      workspacePath = path.join(os.homedir(), workspacePath.slice(1));
    }

    // Validate workspace
    if (!await validateWorkspace(workspacePath)) {
      console.error('❌ Invalid workspace path. Directory does not exist.');
      rl.close();
      process.exit(1);
    }

    // Port
    const portInput = await ask(rl, 'Dashboard port (default: 7000): ');
    const port = portInput ? parseInt(portInput, 10) : 7000;

    if (isNaN(port) || port < 1 || port > 65535) {
      console.error('❌ Invalid port number.');
      rl.close();
      process.exit(1);
    }

    // Auth credentials
    console.log('\n🔐 Set up authentication');
    const username = await ask(rl, 'Username: ');
    if (!username) {
      console.error('❌ Username is required.');
      rl.close();
      process.exit(1);
    }

    const password = await ask(rl, 'Password: ');
    if (!password || password.length < 4) {
      console.error('❌ Password must be at least 4 characters.');
      rl.close();
      process.exit(1);
    }

    rl.close();

    // Create config
    const config: Config = {
      workspacePath: path.resolve(workspacePath),
      port,
      theme: 'dark',
      auth: {
        username,
        passwordHash: hashPassword(password),
      },
      jwtSecret: generateJwtSecret(),
    };

    // Save config
    await fs.mkdir(CONFIG_DIR, { recursive: true });
    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));

    console.log(`\n✅ Config saved to ${CONFIG_FILE}`);
    console.log('\n📋 Summary:');
    console.log(`   Workspace: ${config.workspacePath}`);
    console.log(`   Port: ${config.port}`);
    console.log(`   Username: ${config.auth.username}`);
    console.log('\n🎉 Setup complete! Run "npx @apoorvgarg/life-journey start" to launch.\n');

  } catch (error) {
    rl.close();
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}
