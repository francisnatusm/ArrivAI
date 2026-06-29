/**
 * Copy repo lib/ into frontend/shared before build (Vercel root = frontend).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(__dirname, '../../lib');
const destDir = path.resolve(__dirname, '../shared');

const SHARED_FILES = ['cities.js', 'skills.js', 'countryRegions.js'];

if (!fs.existsSync(srcDir)) {
  if (fs.existsSync(path.join(destDir, 'cities.js'))) {
    console.log('[sync-shared] lib/ not in build context; using committed frontend/shared/');
    process.exit(0);
  }
  console.error('[sync-shared] lib/ not found and frontend/shared/ is empty');
  process.exit(1);
}

fs.mkdirSync(destDir, { recursive: true });

for (const name of SHARED_FILES) {
  const src = path.join(srcDir, name);
  if (!fs.existsSync(src)) {
    console.error('[sync-shared] missing', src);
    process.exit(1);
  }
  fs.copyFileSync(src, path.join(destDir, name));
}

console.log('[sync-shared] synced cities.js, skills.js, countryRegions.js → frontend/shared/');
