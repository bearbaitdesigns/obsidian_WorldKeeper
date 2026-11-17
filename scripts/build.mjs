// Concatenates src/*.js (in name order) into main.js. No dependencies.
// Usage: node scripts/build.mjs
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, 'src');
const parts = readdirSync(srcDir).filter((f) => f.endsWith('.js')).sort();
const out = parts.map((f) => `/* ---- ${f} ---- */\n` + readFileSync(join(srcDir, f), 'utf8')).join('\n');
writeFileSync(join(root, 'main.js'), out);
console.log(`main.js built from ${parts.length} files (${(out.length / 1024).toFixed(1)} KB)`);
