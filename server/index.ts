import express from 'express';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import db from './db.js';
import { sendEbookEmail } from './mailer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || Number(process.env.API_PORT) || 4000;
const DIST_DIR = path.resolve(__dirname, '..', 'dist');
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Multer config for profile image upload
const profileUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      cb(null, `profile-image-${Date.now()}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|webp|gif)$/i;
    if (allowed.test(path.extname(file.originalname))) cb(null, true);
    else cb(new Error('只支援 jpg, png, webp, gif 圖片格式'));
  },
});

app.use(express.json());

// ─── Serve uploaded files (before Vite static) ──────────────────────────────
app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '1h' }));

// ─── Security & SEO Headers ──────────────────────────────────────────────────
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// ─── Session Store ────────────────────────────────────────────────────────────
const sessions = new Map<string, { username: string; createdAt: number }>();
const SESSION_TTL = 24 * 60 * 60 * 1000; // 24 hours

// ─── Auth Middleware ──────────────────────────────────────────────────────────
function adminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const header = req.headers['authorization'];
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token || !sessions.has(token)) {
    res.status(401).json({ error: '未授權，請重新登入。' });
    return;
  }
  const session = sessions.get(token)!;
  if (Date.now() - session.createdAt > SESSION_TTL) {
    sessions.delete(token);
    res.status(401).json({ error: '登入已過期，請重新登入。' });
    return;
  }
  next();
}

// ─── Auth: Login ──────────────────────────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body ?? {};
  if (!username || !password) {
    res.status(400).json({ error: '請輸入帳號與密碼。' });
    return;
  }
  const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username) as any;
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    res.status(401).json({ error: '帳號或密碼錯誤。' });
    return;
  }
  const token = crypto.randomUUID();
  sessions.set(token, { username: user.username, createdAt: Date.now() });
  res.json({ token, username: user.username });
});

// ─── Auth: Logout ─────────────────────────────────────────────────────────────
app.post('/api/auth/logout', (req, res) => {
  const header = req.headers['authorization'];
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) sessions.delete(token);
  res.json({ success: true });
});

// ─── Admin: Account Settings ──────────────────────────────────────────────────
app.put('/api/admin/account', adminAuth, (req, res) => {
  const { username, currentPassword, newPassword } = req.body ?? {};
  if (!currentPassword) {
    res.status(400).json({ error: '請輸入目前密碼。' });
    return;
  }
  // Get current admin (there's only one)
  const user = db.prepare('SELECT * FROM admin_users LIMIT 1').get() as any;
  if (!user || !bcrypt.compareSync(currentPassword, user.password_hash)) {
    res.status(401).json({ error: '目前密碼不正確。' });
    return;
  }
  if (newPassword) {
    const hash = bcrypt.hashSync(newPassword, 10);
    db.prepare("UPDATE admin_users SET password_hash = ?, updated_at = datetime('now', '+8 hours') WHERE id = ?").run(hash, user.id);
  }
  if (username && username !== user.username) {
    db.prepare("UPDATE admin_users SET username = ?, updated_at = datetime('now', '+8 hours') WHERE id = ?").run(username, user.id);
  }
  res.json({ success: true });
});

// ─── Public: Subscribe ────────────────────────────────────────────────────────
app.post('/api/subscribe', (req, res) => {
  const { email } = req.body ?? {};
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: '請輸入有效的 Email 地址。' });
    return;
  }
  try {
    const normalizedEmail = email.toLowerCase().trim();
    db.prepare('INSERT INTO subscribers (email) VALUES (?)').run(normalizedEmail);
    res.json({ success: true, message: '🎉 訂閱成功！《AI 變現全景地圖》將發送至您的信箱。' });
    sendEbookEmail(normalizedEmail).catch((err: Error) =>
      console.error('[mailer] 寄送失敗:', err.message)
    );
  } catch (e: any) {
    if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(409).json({ error: '此 Email 已訂閱過了，感謝您的支持！' });
    } else {
      res.status(500).json({ error: '伺服器錯誤，請稍後再試。' });
    }
  }
});

// ─── Public: Tools List ───────────────────────────────────────────────────────
app.get('/api/tools', (_req, res) => {
  const data = db.prepare('SELECT * FROM tools WHERE is_active = 1 ORDER BY sort_order ASC, id ASC').all();
  res.json(data);
});

// ─── Public: Site Content ─────────────────────────────────────────────────────
app.get('/api/content/:page', (req, res) => {
  const rows = db.prepare('SELECT section, content FROM site_content WHERE page = ?').all(req.params.page) as any[];
  const result: Record<string, any> = {};
  for (const row of rows) {
    try { result[row.section] = JSON.parse(row.content); } catch { /* skip */ }
  }
  res.json(result);
});

// ─── Analytics ────────────────────────────────────────────────────────────────
app.post('/api/analytics/pageview', (req, res) => {
  const { page } = req.body ?? {};
  db.prepare('INSERT INTO page_views (page) VALUES (?)').run(page || '/');
  res.json({ ok: true });
});

app.post('/api/analytics/click', (req, res) => {
  const { url, title } = req.body ?? {};
  db.prepare('INSERT INTO tool_clicks (tool_url, tool_title) VALUES (?, ?)').run(url, title);
  res.json({ ok: true });
});

// ─── Admin: Stats ─────────────────────────────────────────────────────────────
app.get('/api/admin/stats', adminAuth, (_req, res) => {
  const subscribers = (db.prepare('SELECT COUNT(*) as count FROM subscribers').get() as any).count;
  const tools = (db.prepare('SELECT COUNT(*) as count FROM tools WHERE is_active = 1').get() as any).count;
  const pageViews = (db.prepare('SELECT COUNT(*) as count FROM page_views').get() as any).count;
  const clicks = (db.prepare('SELECT COUNT(*) as count FROM tool_clicks').get() as any).count;

  const recentViews = db.prepare(
    `SELECT page, COUNT(*) as count FROM page_views
     WHERE viewed_at >= datetime('now', '-7 days')
     GROUP BY page ORDER BY count DESC`
  ).all();

  const topTools = db.prepare(
    `SELECT tool_title, COUNT(*) as count FROM tool_clicks
     GROUP BY tool_title ORDER BY count DESC LIMIT 5`
  ).all();

  const dailyViews = db.prepare(
    `SELECT DATE(viewed_at) as date, COUNT(*) as count FROM page_views
     WHERE viewed_at >= datetime('now', '-14 days')
     GROUP BY DATE(viewed_at) ORDER BY date ASC`
  ).all();

  res.json({ subscribers, tools, pageViews, clicks, recentViews, topTools, dailyViews });
});

// ─── Admin: Subscribers ───────────────────────────────────────────────────────
app.get('/api/admin/subscribers', adminAuth, (_req, res) => {
  const data = db.prepare('SELECT * FROM subscribers ORDER BY created_at DESC').all();
  res.json(data);
});

app.delete('/api/admin/subscribers/:id', adminAuth, (req, res) => {
  db.prepare('DELETE FROM subscribers WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ─── Admin: Tools CRUD ────────────────────────────────────────────────────────
app.get('/api/admin/tools', adminAuth, (_req, res) => {
  const data = db.prepare('SELECT * FROM tools ORDER BY sort_order ASC, id ASC').all();
  res.json(data);
});

app.post('/api/admin/tools', adminAuth, (req, res) => {
  const { title, description, url, icon_name, category, sort_order } = req.body ?? {};
  if (!title) { res.status(400).json({ error: '工具名稱為必填' }); return; }
  const result = db.prepare(
    `INSERT INTO tools (title, description, url, icon_name, category, sort_order) VALUES (?, ?, ?, ?, ?, ?)`
  ).run(title, description, url, icon_name || 'Wrench', category || '其他', sort_order || 99);
  const tool = db.prepare('SELECT * FROM tools WHERE id = ?').get(result.lastInsertRowid);
  res.json(tool);
});

app.put('/api/admin/tools/:id', adminAuth, (req, res) => {
  const { title, description, url, icon_name, category, is_active, sort_order } = req.body ?? {};
  db.prepare(
    `UPDATE tools SET title=?, description=?, url=?, icon_name=?, category=?, is_active=?, sort_order=?,
     updated_at=datetime('now', '+8 hours') WHERE id=?`
  ).run(title, description, url, icon_name, category, is_active ? 1 : 0, sort_order, req.params.id);
  const tool = db.prepare('SELECT * FROM tools WHERE id = ?').get(req.params.id);
  res.json(tool);
});

app.delete('/api/admin/tools/:id', adminAuth, (req, res) => {
  db.prepare('DELETE FROM tools WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ─── Admin: Site Content ──────────────────────────────────────────────────────
app.put('/api/admin/content/:page/:section', adminAuth, (req, res) => {
  const { page, section } = req.params;
  const { content } = req.body ?? {};
  if (!content) { res.status(400).json({ error: '內容不可為空。' }); return; }
  db.prepare(
    `INSERT INTO site_content (page, section, content, updated_at)
     VALUES (?, ?, ?, datetime('now', '+8 hours'))
     ON CONFLICT(page, section) DO UPDATE SET content = excluded.content, updated_at = excluded.updated_at`
  ).run(page, section, JSON.stringify(content));
  res.json({ success: true, content });
});

// ─── Admin: Upload Profile Image ─────────────────────────────────────────
app.post('/api/admin/upload/profile-image', adminAuth, (req, res) => {
  profileUpload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({ error: '圖片大小不可超過 5MB。' });
      } else {
        res.status(400).json({ error: `上傳錯誤: ${err.message}` });
      }
      return;
    }
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (!req.file) {
      res.status(400).json({ error: '請選擇一張圖片。' });
      return;
    }

    // Remove old profile-image files (keep only the new one)
    try {
      const files = fs.readdirSync(UPLOADS_DIR);
      for (const f of files) {
        if (f.startsWith('profile-image-') && f !== req.file.filename) {
          fs.unlinkSync(path.join(UPLOADS_DIR, f));
        }
      }
    } catch { /* ignore cleanup errors */ }

    const imageUrl = `/uploads/${req.file.filename}`;

    // Update intro content with profileImage field
    const existing = db.prepare("SELECT content FROM site_content WHERE page = 'about' AND section = 'intro'").get() as any;
    let introData: any = {};
    if (existing) {
      try { introData = JSON.parse(existing.content); } catch { /* empty */ }
    }
    introData.profileImage = imageUrl;

    db.prepare(
      `INSERT INTO site_content (page, section, content, updated_at)
       VALUES ('about', 'intro', ?, datetime('now', '+8 hours'))
       ON CONFLICT(page, section) DO UPDATE SET content = excluded.content, updated_at = excluded.updated_at`
    ).run(JSON.stringify(introData));

    res.json({ success: true, imageUrl, intro: introData });
  });
});

// ─── Production: Serve Vite build output ─────────────────────────────────────
if (fs.existsSync(DIST_DIR)) {
  // Static assets (JS, CSS, images) with long cache
  app.use('/assets', express.static(path.join(DIST_DIR, 'assets'), {
    maxAge: '1y',
    immutable: true,
  }));

  // All other static files from dist (favicon, manifest, etc.)
  app.use(express.static(DIST_DIR, {
    maxAge: '1h',
    index: false, // Don't auto-serve index.html — we handle SPA below
  }));
}

// ─── SEO Static Files (fallback to public/ for dev, dist/ for prod) ──────────
const publicDir = path.resolve(__dirname, '..', 'public');
const seoDir = fs.existsSync(DIST_DIR) ? DIST_DIR : publicDir;

app.get('/robots.txt', (_req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.sendFile(path.join(seoDir, 'robots.txt'));
});

app.get('/sitemap.xml', (_req, res) => {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.sendFile(path.join(seoDir, 'sitemap.xml'));
});

app.get('/llms.txt', (_req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.sendFile(path.join(seoDir, 'llms.txt'));
});

app.get('/llms-full.txt', (_req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.sendFile(path.join(seoDir, 'llms-full.txt'));
});

app.get('/favicon.svg', (_req, res) => {
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=604800');
  res.sendFile(path.join(seoDir, 'favicon.svg'));
});

// ─── SPA Catch-All (must be LAST route) ──────────────────────────────────────
if (fs.existsSync(DIST_DIR)) {
  app.get('*', (_req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
