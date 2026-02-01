#!/usr/bin/env node

import { Command } from 'commander';
import { setup } from './commands/setup';
import { start } from './commands/start';
import { stop } from './commands/stop';
import { status } from './commands/status';

const program = new Command();

program
  .name('life-journey')
  .description('📔 Agent life dashboard - visualize memories, tasks, and daily notes')
  .version('1.0.0');

program
  .command('setup')
  .description('Configure your workspace interactively')
  .action(setup);

program
  .command('start')
  .description('Start the dashboard server')
  .option('-p, --port <port>', 'Override port number')
  .option('--no-open', 'Don\'t open browser automatically')
  .action(start);

program
  .command('stop')
  .description('Stop the dashboard server')
  .action(stop);

program
  .command('status')
  .description('Check if dashboard is running')
  .action(status);

program.parse();
