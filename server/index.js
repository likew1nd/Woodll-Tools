import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const distIndex = path.join(distDir, 'index.html');

const dataDir = path.join(rootDir, 'data');
fs.mkdirSync(dataDir, { recursive: true });
const uploadsDir = path.join(dataDir, 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
const dbPath = path.join(dataDir, 'admin.json');
const adapter = new JSONFile(dbPath);
const db = new Low(adapter, {
  admins: [],
  toolsConfig: null,
  siteConfig: null,
});
await db.read();
db.data ||= { admins: [], toolsConfig: null, siteConfig: null };

const defaultSiteConfig = {
  title: '',
  titleDescription: '',
  description: '',
  logoUrl: '',
  canonicalUrl: '',
};

if (!db.data.siteConfig) {
  db.data.siteConfig = { ...defaultSiteConfig };
  await db.write();
}

const defaultAdminUsername = process.env.ADMIN_USERNAME ?? 'admin';
const defaultAdminPassword = process.env.ADMIN_PASSWORD ?? 'admin123';
const jwtSecret = process.env.ADMIN_JWT_SECRET ?? 'change-me';

const existingAdmin = db.data.admins[0];
if (!existingAdmin) {
  const passwordHash = bcrypt.hashSync(defaultAdminPassword, 10);
  db.data.admins.push({
    id: 1,
    username: defaultAdminUsername,
    password_hash: passwordHash,
    created_at: new Date().toISOString(),
  });
  await db.write();
  // eslint-disable-next-line no-console
  console.log(`Created default admin user: ${defaultAdminUsername}`);
}

if (jwtSecret === 'change-me') {
  // eslint-disable-next-line no-console
  console.warn('ADMIN_JWT_SECRET is not set. Please set it before deploying to production.');
}

const app = express();
app.use(express.json({ limit: '2mb' }));

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization ?? '';
  const [, token] = authHeader.split(' ');
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = payload;
    return next();
  }
  catch (_err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body ?? {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing credentials' });
  }

  const user = db.data.admins.find(admin => admin.username === username);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isValid = bcrypt.compareSync(password, user.password_hash);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, jwtSecret, { expiresIn: '12h' });
  return res.json({ token });
});

app.post('/api/auth/change-password', authMiddleware, async (req, res) => {
  const { oldPassword, newPassword } = req.body ?? {};
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Missing credentials' });
  }

  const user = db.data.admins.find(admin => admin.id === req.user?.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const isValid = bcrypt.compareSync(oldPassword, user.password_hash);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const passwordHash = bcrypt.hashSync(newPassword, 10);
  user.password_hash = passwordHash;
  await db.write();

  return res.json({ ok: true });
});

app.get('/api/tools-config', (_req, res) => {
  const config = db.data.toolsConfig;
  return res.json({ config });
});

app.get('/api/site-config', (_req, res) => {
  return res.json({ config: db.data.siteConfig ?? defaultSiteConfig });
});

app.put('/api/site-config', authMiddleware, async (req, res) => {
  const { config } = req.body ?? {};
  if (!config || typeof config !== 'object') {
    return res.status(400).json({ error: 'Invalid config' });
  }

  db.data.siteConfig = { ...defaultSiteConfig, ...config };
  await db.write();

  return res.json({ ok: true });
});

function buildVpsSvg({
  currencySymbol = 'CNY ',
  remainingValue = '--',
  remainingValuePay = '--',
  remainingBaseValue = '--',
  premiumValue = '--',
  remainingDays = '--',
  formattedAsOf = '--',
  formattedEnd = '--',
  providerHost = '',
} = {}) {
  const esc = (value) => String(value).replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[s]));

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 780">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#111827"/>
    </linearGradient>
  </defs>
  <rect width="600" height="780" rx="28" fill="url(#bg)"/>
  <rect x="40" y="40" width="520" height="420" rx="22" fill="#0b1220" stroke="#1f2937"/>
  <rect x="240" y="80" width="120" height="120" rx="24" fill="#22c55e"/>
  <text x="300" y="155" text-anchor="middle" font-size="48" fill="#ffffff" font-family="sans-serif">$</text>
  <text x="300" y="230" text-anchor="middle" font-size="22" fill="#e2e8f0" font-family="sans-serif">剩余价值</text>
  <text x="300" y="300" text-anchor="middle" font-size="48" fill="#22c55e" font-weight="700" font-family="sans-serif">${esc(remainingValue)}</text>
  <text x="300" y="340" text-anchor="middle" font-size="20" fill="#94a3b8" font-family="sans-serif">≈ ${esc(remainingValuePay)}</text>
  <text x="80" y="390" font-size="14" fill="#94a3b8" font-family="sans-serif">价值评估</text>
  <text x="480" y="390" text-anchor="end" font-size="14" fill="#94a3b8" font-family="sans-serif">低价值</text>
  <rect x="80" y="405" width="440" height="10" rx="5" fill="#1f2937"/>
  <rect x="80" y="405" width="160" height="10" rx="5" fill="#7dd3fc"/>

  <rect x="40" y="500" width="520" height="220" rx="22" fill="#0b1220" stroke="#1f2937"/>
  <circle cx="90" cy="560" r="26" fill="#1e3a8a"/>
  <text x="90" y="568" text-anchor="middle" font-size="18" fill="#93c5fd" font-family="sans-serif">🕙︎</text>
  <text x="140" y="560" font-size="20" fill="#e2e8f0" font-family="sans-serif">剩余时间</text>
  <text x="140" y="590" font-size="14" fill="#94a3b8" font-family="sans-serif">到期于 ${esc(formattedEnd)}</text>
  <text x="520" y="560" text-anchor="end" font-size="42" fill="#3b82f6" font-weight="700" font-family="sans-serif">${esc(remainingDays)}</text>
  <text x="520" y="590" text-anchor="end" font-size="14" fill="#94a3b8" font-family="sans-serif">天</text>
  <text x="80" y="690" font-size="14" fill="#94a3b8" font-family="sans-serif">${esc(formattedAsOf)}</text>
  <text x="520" y="690" text-anchor="end" font-size="14" fill="#94a3b8" font-family="sans-serif">${esc(formattedEnd)}</text>
  <text x="300" y="750" text-anchor="middle" font-size="12" fill="#94a3b8" font-family="sans-serif">由 ${esc(providerHost)} 提供</text>
</svg>`;
}

app.get('/api/vps-remaining-value/svg', (_req, res) => {
  const svg = buildVpsSvg();
  res.setHeader('Content-Type', 'image/svg+xml');
  return res.send(svg);
});

app.post('/api/vps-remaining-value/svg', (req, res) => {
  const svg = buildVpsSvg(req.body ?? {});
  res.setHeader('Content-Type', 'image/svg+xml');
  return res.send(svg);
});


app.post('/api/vps-remaining-value/svg/save', (req, res) => {
  const svg = buildVpsSvg(req.body ?? {});
  const fileName = `vps_${Date.now()}_${crypto.randomBytes(8).toString('hex')}.svg`;
  const filePath = path.join(uploadsDir, fileName);
  fs.writeFileSync(filePath, svg, 'utf8');
  const relativeUrl = `/uploads/${fileName}`;
  const absoluteUrl = `${req.protocol}://${req.get('host')}${relativeUrl}`;
  return res.json({ url: absoluteUrl, path: relativeUrl });
});

app.put('/api/tools-config', authMiddleware, async (req, res) => {
  const { config } = req.body ?? {};
  if (!config || typeof config !== 'object') {
    return res.status(400).json({ error: 'Invalid config' });
  }

  const now = new Date().toISOString();
  db.data.toolsConfig = { ...config, updatedAt: now };
  await db.write();

  return res.json({ ok: true });
});

app.use('/uploads', express.static(uploadsDir));
app.use(express.static(distDir, { index: false }));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' });
  }

  if (!fs.existsSync(distIndex)) {
    return res.status(404).send('Frontend not built. Run pnpm build.');
  }

  return res.sendFile(distIndex);
});

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Admin server listening on http://localhost:${port}`);
});
