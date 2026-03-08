import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../data');
const DB_PATH = path.join(DATA_DIR, 'app.db');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now', '+8 hours')),
    source TEXT DEFAULT 'website'
  );

  CREATE TABLE IF NOT EXISTS tools (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    url TEXT,
    icon_name TEXT DEFAULT 'Wrench',
    category TEXT DEFAULT '其他',
    is_active INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now', '+8 hours')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', '+8 hours'))
  );

  CREATE TABLE IF NOT EXISTS page_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page TEXT NOT NULL,
    viewed_at TEXT NOT NULL DEFAULT (datetime('now', '+8 hours'))
  );

  CREATE TABLE IF NOT EXISTS tool_clicks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tool_url TEXT,
    tool_title TEXT,
    clicked_at TEXT NOT NULL DEFAULT (datetime('now', '+8 hours'))
  );

  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now', '+8 hours')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', '+8 hours'))
  );

  CREATE TABLE IF NOT EXISTS site_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page TEXT NOT NULL,
    section TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '{}',
    updated_at TEXT NOT NULL DEFAULT (datetime('now', '+8 hours')),
    UNIQUE(page, section)
  );
`);

// Seed initial tools if empty
const toolCount = (db.prepare('SELECT COUNT(*) as count FROM tools').get() as { count: number }).count;
if (toolCount === 0) {
  const insert = db.prepare(
    `INSERT INTO tools (title, description, url, icon_name, category, sort_order) VALUES (?, ?, ?, ?, ?, ?)`
  );
  const seed = [
    ['YT 音樂頻道 歌詞產生器', '輸入曲風與主題，AI 自動為你產出押韻且具備情感共鳴的歌詞，適合原創音樂頻道。', 'https://jshao-tubeflow.zeabur.app', 'Music', '內容創作', 1],
    ['台灣彩券賓果賓果預測器', '透過歷史開獎數據與機率模型，輔助分析賓果賓果的熱門號碼與冷門號碼趨勢。', 'https://bingo-predictor.zeabur.app', 'Dices', '數據分析', 2],
    ['台灣彩券今彩539 號碼分析器', '整合今彩539歷期開獎紀錄，提供拖牌、連莊號等統計數據，幫助你制定選號策略。', 'https://lottery539.zeabur.app', 'Hash', '數據分析', 3],
    ['紫微斗數 / 塔羅牌 / 每日星座', '結合東方命理與西方占星，提供每日運勢解析、塔羅抽牌與紫微命盤基礎排盤。', 'https://divination-jteam2026.zeabur.app', 'Sparkles', '命理占卜', 4],
    ['餐飲業 點餐出單 小工具', '專為小型餐飲業設計的輕量級點餐系統，支援快速點單與營收統計。', 'https://streetorder.zeabur.app', 'Utensils', '商業應用', 5],
    ['記帳日記', '結合日常隨筆與收支紀錄，輕鬆管理個人財務。', 'https://keepspend.zeabur.app', 'BookOpen', '生活效率', 6],
    ['新手入門AI小技巧工具庫', '收錄最實用的 AI 詠唱指令 (Prompts) 與工作流教學，幫助新手快速掌握 AI 應用。', 'https://jay-ai-tips.zeabur.app', 'Lightbulb', '學習資源', 7],
  ];
  for (const row of seed) insert.run(...(row as [string, string, string, string, string, number]));
}

// Seed default admin if empty
const adminCount = (db.prepare('SELECT COUNT(*) as count FROM admin_users').get() as { count: number }).count;
if (adminCount === 0) {
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)').run('admin', hash);
}

export default db;
