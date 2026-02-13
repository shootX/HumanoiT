import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR = path.join(__dirname, 'logs');
const LOG_FILE = path.join(LOG_DIR, 'e2e-run.log');

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

export function initLog(): void {
  ensureLogDir();
  const header = `\n${'='.repeat(60)}\nE2E Run: ${new Date().toISOString()}\n${'='.repeat(60)}\n`;
  fs.writeFileSync(LOG_FILE, header, 'utf8');
}

export function logStep(step: string, status: 'ok' | 'fail', detail?: string): void {
  ensureLogDir();
  const line = `[${new Date().toISOString()}] ${status.toUpperCase()} | ${step}${detail ? ` | ${detail}` : ''}\n`;
  fs.appendFileSync(LOG_FILE, line, 'utf8');
}

export function logSection(title: string): void {
  ensureLogDir();
  fs.appendFileSync(LOG_FILE, `\n--- ${title} ---\n`, 'utf8');
}

export function getLogPath(): string {
  return LOG_FILE;
}
