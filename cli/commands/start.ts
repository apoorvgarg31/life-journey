import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const CONFIG_FILE = path.join(os.homedir(), '.config', 'life-journey', 'config.json');
const PID_FILE = path.join(os.homedir(), '.config', 'life-journey', 'server.pid');

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

async function getConfig(): Promise<Config> {
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf-8');
    return JSON.parse(data) as Config;
  } catch {
    throw new Error('Config not found. Run "npx @apoorvgarg/life-journey setup" first.');
  }
}

async function isPortInUse(port: number): Promise<boolean> {
  try {
    await execAsync(`lsof -i:${port} -t`);
    return true;
  } catch {
    return false;
  }
}

async function openBrowser(url: string): Promise<void> {
  const platform = process.platform;
  let cmd: string;

  if (platform === 'darwin') {
    cmd = `open "${url}"`;
  } else if (platform === 'win32') {
    cmd = `start "" "${url}"`;
  } else {
    // Linux - try xdg-open, then fallback to other options
    cmd = `xdg-open "${url}" 2>/dev/null || sensible-browser "${url}" 2>/dev/null || x-www-browser "${url}" 2>/dev/null || echo "Open ${url} in your browser"`;
  }

  try {
    await execAsync(cmd);
  } catch {
    console.log(`🌐 Open ${url} in your browser`);
  }
}

interface StartOptions {
  port?: string;
  open?: boolean;
}

export async function start(options: StartOptions): Promise<void> {
  console.log('\n🚀 Starting Life Journey Dashboard...\n');

  try {
    const config = await getConfig();
    const port = options.port ? parseInt(options.port, 10) : config.port;

    // Check if already running
    try {
      const pid = await fs.readFile(PID_FILE, 'utf-8');
      try {
        process.kill(parseInt(pid), 0);
        console.log(`⚠️  Dashboard already running (PID: ${pid})`);
        console.log(`🌐 http://localhost:${port}`);
        return;
      } catch {
        // Process not running, clean up stale PID file
        await fs.unlink(PID_FILE).catch(() => {});
      }
    } catch {
      // No PID file, continue
    }

    // Check if port is in use
    if (await isPortInUse(port)) {
      console.error(`❌ Port ${port} is already in use.`);
      process.exit(1);
    }

    // Find the dashboard directory
    const dashboardDir = path.resolve(__dirname, '..', '..', 'dashboard');
    
    // Check if we're running from source or installed package
    let serverDir: string;
    try {
      await fs.access(dashboardDir);
      serverDir = dashboardDir;
    } catch {
      // Fallback: we might be in the source directory
      serverDir = path.resolve(__dirname, '..', '..');
    }

    console.log(`📂 Workspace: ${config.workspacePath}`);
    console.log(`🔌 Port: ${port}`);

    // Start Next.js server
    const env = {
      ...process.env,
      PORT: port.toString(),
      LIFE_JOURNEY_CONFIG: CONFIG_FILE,
    };

    const serverProcess = spawn('npm', ['run', 'start'], {
      cwd: serverDir,
      env,
      detached: true,
      stdio: 'ignore',
    });

    serverProcess.unref();

    // Save PID
    if (serverProcess.pid) {
      await fs.writeFile(PID_FILE, serverProcess.pid.toString());
    }

    // Wait a bit for server to start
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const url = `http://localhost:${port}`;
    console.log(`\n✅ Dashboard started!`);
    console.log(`🌐 ${url}\n`);

    // Open browser unless --no-open
    if (options.open !== false) {
      await openBrowser(url);
    }

  } catch (error) {
    console.error('❌ Failed to start:', (error as Error).message);
    process.exit(1);
  }
}
