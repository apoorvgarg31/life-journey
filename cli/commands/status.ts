import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const CONFIG_FILE = path.join(os.homedir(), '.config', 'life-journey', 'config.json');
const PID_FILE = path.join(os.homedir(), '.config', 'life-journey', 'server.pid');

interface Config {
  workspacePath: string;
  port: number;
}

async function getConfig(): Promise<Config | null> {
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf-8');
    return JSON.parse(data) as Config;
  } catch {
    return null;
  }
}

async function checkServerHealth(port: number): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:${port}/api/auth/check`);
    return response.status === 200 || response.status === 401;
  } catch {
    return false;
  }
}

export async function status(): Promise<void> {
  console.log('\n📊 Life Journey Status\n');

  // Check config
  const config = await getConfig();
  if (!config) {
    console.log('⚠️  Not configured');
    console.log('   Run: npx @apoorvgarg/life-journey setup\n');
    return;
  }

  console.log(`📂 Workspace: ${config.workspacePath}`);
  console.log(`🔌 Port: ${config.port}`);

  // Check if running
  try {
    const pid = await fs.readFile(PID_FILE, 'utf-8');
    const pidNum = parseInt(pid, 10);

    try {
      process.kill(pidNum, 0);
      
      // Process exists, check if server is healthy
      const healthy = await checkServerHealth(config.port);
      
      if (healthy) {
        console.log(`✅ Status: Running (PID: ${pidNum})`);
        console.log(`🌐 URL: http://localhost:${config.port}\n`);
      } else {
        console.log(`⚠️  Status: Process running but server not responding`);
        console.log(`   PID: ${pidNum}`);
        console.log(`   Try: npx @apoorvgarg/life-journey stop && npx @apoorvgarg/life-journey start\n`);
      }
    } catch {
      // Process not running
      console.log('🔴 Status: Not running');
      console.log('   Run: npx @apoorvgarg/life-journey start\n');
      
      // Clean up stale PID file
      await fs.unlink(PID_FILE).catch(() => {});
    }
  } catch {
    // No PID file
    console.log('🔴 Status: Not running');
    console.log('   Run: npx @apoorvgarg/life-journey start\n');
  }
}
