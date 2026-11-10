import { appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
const COLORS: Record<LogLevel, string> = {
  DEBUG: '\x1b[90m', // gray
  INFO: '\x1b[36m', // cyan
  WARN: '\x1b[33m', // yellow
  ERROR: '\x1b[31m', // red
};

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

const LEVEL_ORDER: Record<LogLevel, number> = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };


/* 'DD-MM-YYYY HH:mm:ss.mmm' stamp (UTC) */
function formatDate(date: Date): string {
  const iso = date.toISOString();
  return `${iso.slice(8, 10)}-${iso.slice(5, 7)}-${iso.slice(0, 4)}-${iso.slice(11, 23)}`;
}

const LOG_DIR = process.env.LOG_DIR ?? 'logs';
const LOG_FILE = process.env.LOG_FILE ?? join(LOG_DIR, `playwright-${formatDate(new Date())}.txt`);

const workerTag =
  process.env.TEST_WORKER_INDEX !== undefined ? ` [W${process.env.TEST_WORKER_INDEX}]` : '';

let logDirReady = false;

function writeToFile(line: string): void {
  try {
    if (!logDirReady) {
      mkdirSync(LOG_DIR, { recursive: true });
      logDirReady = true;
    }
    appendFileSync(LOG_FILE, line + '\n', { flag: 'a' });
  } 
  catch {}
}

function emit(level: LogLevel, scope: string, message: string): void {
  if (LEVEL_ORDER[level] === undefined) return; 
  const now = new Date();
  const stamp = formatDate(now);
  const tag = `${COLORS[level]}${BOLD}[${level}]${RESET}`;
  const origin = `${COLORS[level]}${scope}${RESET}`;
  console.log(`${COLORS['DEBUG']}${stamp}${RESET} ${tag} ${origin} — ${message}`);
  writeToFile(`${stamp} [${level}]${workerTag} ${scope} — ${message}`);
}


export class Logger {
  private constructor() {  }

  static debug(scope: string, message: string):void {
    emit('DEBUG', scope, message);
  }

  static info(scope: string, message: string): void {
    emit('INFO', scope, message);
  }

  static warn(scope: string, message: string): void {
    emit('WARN', scope, message);
  }

  static error(scope: string, message: string): void {
    emit('ERROR', scope, message);
  }

  static async step<T>(scope: string, name: string, fn: () => Promise<T>): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      Logger.debug(scope, `${name} finished in ${Date.now() - start}ms`);
      return result;
    } catch (error) {
      Logger.error(
        scope,
        `${name} failed after ${Date.now() - start}ms: ${(error as Error).message}`,
      );
      throw error;
    }
  }
}
