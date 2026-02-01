import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

const PID_FILE = path.join(os.homedir(), '.config', 'life-journey', 'server.pid');

export async function stop(): Promise<void> {
  console.log('\n🛑 Stopping Life Journey Dashboard...\n');

  try {
    const pid = await fs.readFile(PID_FILE, 'utf-8');
    const pidNum = parseInt(pid, 10);

    try {
      // Check if process exists
      process.kill(pidNum, 0);
      
      // Kill the process
      process.kill(pidNum, 'SIGTERM');
      
      // Wait a moment
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Force kill if still running
      try {
        process.kill(pidNum, 0);
        process.kill(pidNum, 'SIGKILL');
      } catch {
        // Process already stopped
      }

      // Clean up PID file
      await fs.unlink(PID_FILE).catch(() => {});
      
      console.log(`✅ Dashboard stopped (PID: ${pidNum})\n`);
    } catch {
      console.log('⚠️  Dashboard was not running.\n');
      await fs.unlink(PID_FILE).catch(() => {});
    }
  } catch {
    console.log('⚠️  Dashboard is not running (no PID file).\n');
  }
}
