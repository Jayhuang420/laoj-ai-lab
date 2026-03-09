import express from 'express';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import db from './db.js';
import { sendEbookEmail, sendInquiryConfirmation, sendAdminNotification } from './mailer.js';
import { createNotionInquiry, updateNotionStatus, isNotionEnabled } from './notion.js';

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

// ─── Session Store (SQLite-backed, survives server restarts) ─────────────────
const SESSION_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Prepared statements for session CRUD
const stmtGetSession = db.prepare('SELECT * FROM sessions WHERE token = ?');
const stmtInsertSession = db.prepare('INSERT INTO sessions (token, username, created_at) VALUES (?, ?, ?)');
const stmtDeleteSession = db.prepare('DELETE FROM sessions WHERE token = ?');
const stmtCleanExpired = db.prepare('DELETE FROM sessions WHERE created_at < ?');

// Clean expired sessions on startup
stmtCleanExpired.run(Date.now() - SESSION_TTL);

// ─── Auth Middleware ──────────────────────────────────────────────────────────
function adminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const header = req.headers['authorization'];
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  const session = token ? stmtGetSession.get(token) as any : null;
  if (!token || !session) {
    res.status(401).json({ error: '未授權，請重新登入。' });
    return;
  }
  if (Date.now() - session.created_at > SESSION_TTL) {
    stmtDeleteSession.run(token);
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
  stmtInsertSession.run(token, user.username, Date.now());
  res.json({ token, username: user.username });
});

// ─── Auth: Logout ─────────────────────────────────────────────────────────────
app.post('/api/auth/logout', (req, res) => {
  const header = req.headers['authorization'];
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) stmtDeleteSession.run(token);
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

// ─── Rate Limiter (in-memory) ─────────────────────────────────────────────
const inquiryRateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 3;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = inquiryRateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    inquiryRateMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

// ─── Public: Submit Inquiry ──────────────────────────────────────────────
app.post('/api/inquiries', (req, res) => {
  const { name, email, company, service_type, budget, message } = req.body ?? {};

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    res.status(400).json({ error: '請填寫姓名、Email 與諮詢內容。' });
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: '請輸入有效的 Email 地址。' });
    return;
  }

  const ip = req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) {
    res.status(429).json({ error: '提交次數過於頻繁，請 15 分鐘後再試。' });
    return;
  }

  try {
    const result = db.prepare(
      `INSERT INTO inquiries (name, email, company, service_type, budget, message)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(name.trim(), email.trim().toLowerCase(), company?.trim() || '', service_type || '其他', budget || '', message.trim());

    const inquiryId = result.lastInsertRowid;
    const inquiry = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(inquiryId) as any;

    res.json({ success: true, message: '諮詢已送出，我們會盡快回覆！' });

    // Fire-and-forget: confirmation email, admin notification, Notion sync
    sendInquiryConfirmation(email.trim().toLowerCase(), name.trim()).catch((err: Error) =>
      console.error('[mailer] 確認信寄送失敗:', err.message)
    );
    sendAdminNotification({ name: name.trim(), email: email.trim().toLowerCase(), company: company?.trim() || '', service_type: service_type || '其他', budget: budget || '', message: message.trim() }).catch((err: Error) =>
      console.error('[mailer] 管理員通知失敗:', err.message)
    );
    createNotionInquiry({ name: name.trim(), email: email.trim().toLowerCase(), company: company?.trim() || '', service_type: service_type || '其他', budget: budget || '', message: message.trim(), created_at: inquiry?.created_at || new Date().toISOString() }).then((pageId) => {
      if (pageId) {
        db.prepare('UPDATE inquiries SET notion_page_id = ? WHERE id = ?').run(pageId, inquiryId);
      }
    }).catch((err: Error) =>
      console.error('[notion] Notion 寫入失敗:', err.message)
    );
  } catch (e: any) {
    console.error('[inquiries] 提交失敗:', e.message);
    res.status(500).json({ error: '伺服器錯誤，請稍後再試。' });
  }
});

// ─── Admin: Inquiries CRUD ──────────────────────────────────────────────
app.get('/api/admin/inquiries', adminAuth, (_req, res) => {
  const data = db.prepare('SELECT * FROM inquiries ORDER BY created_at DESC').all();
  res.json(data);
});

app.put('/api/admin/inquiries/:id', adminAuth, (req, res) => {
  const { status } = req.body ?? {};
  if (!status || !['new', 'contacted', 'closed'].includes(status)) {
    res.status(400).json({ error: '無效的狀態值。' });
    return;
  }
  db.prepare("UPDATE inquiries SET status = ?, updated_at = datetime('now', '+8 hours') WHERE id = ?").run(status, req.params.id);
  const inquiry = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(req.params.id) as any;

  // 同步狀態到 Notion（fire-and-forget）
  if (inquiry?.notion_page_id) {
    updateNotionStatus(inquiry.notion_page_id, status).catch((err: Error) =>
      console.error('[notion] 狀態同步失敗:', err.message)
    );
  }

  res.json({ ...inquiry, notion_synced: !!inquiry?.notion_page_id });
});

// 手動同步單筆諮詢到 Notion
app.post('/api/admin/inquiries/:id/sync-notion', adminAuth, async (req, res) => {
  const inquiry = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(req.params.id) as any;
  if (!inquiry) { res.status(404).json({ error: '找不到此諮詢' }); return; }
  if (inquiry.notion_page_id) { res.json({ notion_page_id: inquiry.notion_page_id, message: '已同步' }); return; }
  if (!isNotionEnabled()) { res.status(400).json({ error: 'Notion 整合未啟用，請設定 NOTION_TOKEN' }); return; }

  try {
    const pageId = await createNotionInquiry({
      name: inquiry.name,
      email: inquiry.email,
      company: inquiry.company,
      service_type: inquiry.service_type,
      budget: inquiry.budget,
      message: inquiry.message,
      created_at: inquiry.created_at,
    });
    if (pageId) {
      db.prepare('UPDATE inquiries SET notion_page_id = ? WHERE id = ?').run(pageId, inquiry.id);
      res.json({ notion_page_id: pageId, message: '同步成功' });
    } else {
      res.status(500).json({ error: 'Notion 寫入失敗' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/inquiries/:id', adminAuth, (req, res) => {
  db.prepare('DELETE FROM inquiries WHERE id = ?').run(req.params.id);
  res.json({ success: true });
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

// ─── Multer config for blog cover image ──────────────────────────────────────
const blogUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      cb(null, `blog-cover-${Date.now()}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|webp|gif)$/i;
    if (allowed.test(path.extname(file.originalname))) cb(null, true);
    else cb(new Error('只支援 jpg, png, webp, gif 圖片格式'));
  },
});

// ─── Public: Blog Posts ──────────────────────────────────────────────────────
app.get('/api/blog', (_req, res) => {
  const posts = db.prepare(
    `SELECT id, slug, title, excerpt, cover_image, category, tags, author, view_count, created_at, published_at
     FROM blog_posts WHERE status = 'published'
     ORDER BY published_at DESC`
  ).all();
  res.json(posts);
});

app.get('/api/blog/:slug', (req, res) => {
  const post = db.prepare(
    `SELECT * FROM blog_posts WHERE slug = ? AND status = 'published'`
  ).get(req.params.slug) as any;
  if (!post) { res.status(404).json({ error: '找不到此文章。' }); return; }
  // Increment view count
  db.prepare('UPDATE blog_posts SET view_count = view_count + 1 WHERE id = ?').run(post.id);
  post.view_count += 1;
  res.json(post);
});

// ─── Admin: Blog CRUD ────────────────────────────────────────────────────────
app.get('/api/admin/blog', adminAuth, (_req, res) => {
  const posts = db.prepare('SELECT * FROM blog_posts ORDER BY created_at DESC').all();
  res.json(posts);
});

app.get('/api/admin/blog/:id', adminAuth, (req, res) => {
  const post = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(req.params.id);
  if (!post) { res.status(404).json({ error: '找不到此文章。' }); return; }
  res.json(post);
});

app.post('/api/admin/blog', adminAuth, (req, res) => {
  const { title, slug, excerpt, content, cover_image, category, tags, status, author } = req.body ?? {};
  if (!title) { res.status(400).json({ error: '文章標題為必填' }); return; }
  const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/gi, '-').replace(/(^-|-$)/g, '') || `post-${Date.now()}`;

  try {
    const publishedAt = status === 'published' ? new Date().toISOString() : null;
    const result = db.prepare(
      `INSERT INTO blog_posts (title, slug, excerpt, content, cover_image, category, tags, status, author, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(title, finalSlug, excerpt || '', content || '', cover_image || '', category || '一般',
      JSON.stringify(tags || []), status || 'draft', author || '老J', publishedAt);
    const post = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(result.lastInsertRowid);
    res.json(post);
  } catch (e: any) {
    if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(409).json({ error: '此文章網址代稱已存在，請使用其他代稱。' });
    } else {
      res.status(500).json({ error: '伺服器錯誤，請稍後再試。' });
    }
  }
});

app.put('/api/admin/blog/:id', adminAuth, (req, res) => {
  const { title, slug, excerpt, content, cover_image, category, tags, status, author } = req.body ?? {};
  const existing = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(req.params.id) as any;
  if (!existing) { res.status(404).json({ error: '找不到此文章。' }); return; }

  // Set published_at when first published
  let publishedAt = existing.published_at;
  if (status === 'published' && !existing.published_at) {
    publishedAt = new Date().toISOString();
  }

  try {
    db.prepare(
      `UPDATE blog_posts SET title=?, slug=?, excerpt=?, content=?, cover_image=?, category=?, tags=?,
       status=?, author=?, published_at=?, updated_at=datetime('now', '+8 hours') WHERE id=?`
    ).run(title, slug, excerpt, content, cover_image, category, JSON.stringify(tags || []),
      status, author, publishedAt, req.params.id);
    const post = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(req.params.id);
    res.json(post);
  } catch (e: any) {
    if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(409).json({ error: '此文章網址代稱已存在。' });
    } else {
      res.status(500).json({ error: '伺服器錯誤。' });
    }
  }
});

app.delete('/api/admin/blog/:id', adminAuth, (req, res) => {
  db.prepare('DELETE FROM blog_posts WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Blog cover image upload
app.post('/api/admin/upload/blog-cover', adminAuth, (req, res) => {
  blogUpload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      res.status(400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? '圖片不可超過 5MB。' : `上傳錯誤: ${err.message}` });
      return;
    }
    if (err) { res.status(400).json({ error: err.message }); return; }
    if (!req.file) { res.status(400).json({ error: '請選擇一張圖片。' }); return; }
    res.json({ success: true, imageUrl: `/uploads/${req.file.filename}` });
  });
});

// Blog inline image upload
const blogImageUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      cb(null, `blog-img-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|webp|gif)$/i;
    if (allowed.test(path.extname(file.originalname))) cb(null, true);
    else cb(new Error('只支援 jpg, png, webp, gif 圖片格式'));
  },
});

app.post('/api/admin/upload/blog-image', adminAuth, (req, res) => {
  blogImageUpload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      res.status(400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? '圖片不可超過 5MB。' : `上傳錯誤: ${err.message}` });
      return;
    }
    if (err) { res.status(400).json({ error: err.message }); return; }
    if (!req.file) { res.status(400).json({ error: '請選擇一張圖片。' }); return; }
    res.json({ success: true, url: `/uploads/${req.file.filename}` });
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
  res.setHeader('Cache-Control', 'public, max-age=3600');
  const today = new Date().toISOString().split('T')[0];
  const staticPages = [
    { loc: '/', changefreq: 'weekly', priority: '1.0' },
    { loc: '/tools', changefreq: 'weekly', priority: '0.9' },
    { loc: '/blog', changefreq: 'daily', priority: '0.9' },
    { loc: '/about', changefreq: 'monthly', priority: '0.8' },
    { loc: '/contact', changefreq: 'monthly', priority: '0.8' },
  ];
  let urls = staticPages.map(p =>
    `  <url><loc>https://www.oldjailab.com${p.loc}</loc><lastmod>${today}</lastmod><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`
  ).join('\n');
  try {
    const posts = db.prepare("SELECT slug, updated_at FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC").all() as { slug: string; updated_at: string }[];
    for (const post of posts) {
      const lastmod = post.updated_at ? post.updated_at.split(' ')[0] : today;
      urls += `\n  <url><loc>https://www.oldjailab.com/blog/${post.slug}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`;
    }
  } catch { /* ignore if blog table issue */ }
  res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`);
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
