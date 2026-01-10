import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const distDir = path.join(root, 'dist');
const srcDir = path.join(root, 'server', 'php');
const destApi = path.join(distDir, 'api');
const destData = path.join(distDir, 'data');
const destUploads = path.join(distDir, 'uploads');

if (!fs.existsSync(distDir)) {
  // eslint-disable-next-line no-console
  console.error('dist/ not found. Run build first.');
  process.exit(1);
}

fs.mkdirSync(destApi, { recursive: true });
fs.mkdirSync(destData, { recursive: true });
fs.mkdirSync(destUploads, { recursive: true });

fs.cpSync(srcDir, destApi, { recursive: true });

const htaccess = path.join(srcDir, 'data', '.htaccess');
if (fs.existsSync(htaccess)) {
  fs.copyFileSync(htaccess, path.join(destData, '.htaccess'));
}

// eslint-disable-next-line no-console
console.log('Copied PHP API to dist/api and created dist/data.');
