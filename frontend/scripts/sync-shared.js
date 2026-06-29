/**
 * Copy repo lib/ into frontend/shared before build (Vercel root = frontend).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(__dirname, '../../lib');
const destDir = path.resolve(__dirname, '../shared');

if (!fs.existsSync(srcDir)) {
  console.error('[sync-shared] lib/ not found at', srcDir);
  process.exit(1);
}

fs.mkdirSync(destDir, { recursive: true });

for (const name of fs.readdirSync(srcDir)) {
  if (!name.endsWith('.js')) continue;
  fs.copyFileSync(path.join(srcDir, name), path.join(destDir, name));
}

console.log('[sync-shared] copied lib/*.js → frontend/shared/');
