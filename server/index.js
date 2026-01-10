import fs from 'node:fs';
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
const dbPath = path.join(dataDir, 'admin.json');
const adapter = new JSONFile(dbPath);
const db = new Low(adapter, { admins: [], toolsConfig: null });
await db.read();
db.data ||= { admins: [], toolsConfig: null };

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
