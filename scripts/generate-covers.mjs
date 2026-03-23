/**
 * 批量生成部落格封面圖
 * 品牌色調：#1E3A8A (深藍), #0f172a (墨黑), #FDFCFB (米白)
 * 尺寸：1200x630 (16:9 OG 標準)
 */
import { createCanvas, registerFont } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, 'covers');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const W = 1200, H = 630;

// Category icon mapping (emoji as fallback)
const CATEGORY_CONFIG = {
  '工具介紹': { emoji: '🔧', gradient: ['#1E3A8A', '#2563eb'] },
  '技術教學': { emoji: '💡', gradient: ['#0f172a', '#1e40af'] },
  'AI 應用':  { emoji: '🤖', gradient: ['#1e293b', '#1E3A8A'] },
  '一般':     { emoji: '📝', gradient: ['#334155', '#1E3A8A'] },
};

// All blog posts
const POSTS = [
  { id: 1, title: '用 AI 秒出專業人像提示詞！\n我用 Vibe Coding 打造的免費工具', category: 'AI 應用', slug: 'post-1' },
  { id: 2, title: '免費算命不用排隊！\n我用 Vibe Coding 打造的命運星盤工具', category: '工具介紹', slug: 'post-2' },
  { id: 3, title: '月底不再心慌！\n我用 Vibe Coding 打造的免費記帳 App', category: '工具介紹', slug: 'post-3' },
  { id: 4, title: 'ChatGPT 問不好？\n26 個 AI 技巧讓你秒變提示詞高手', category: 'AI 應用', slug: 'post-4' },
  { id: 5, title: '單週 80 萬瀏覽、6 萬人同時上線！\n賓果賓果 AI 預測器爆紅始末', category: '工具介紹', slug: 'post-5' },
  { id: 6, title: '選號不再靠感覺！\n今彩539 AI 預測器 4 大策略秒出推薦號碼', category: '工具介紹', slug: 'post-6' },
  { id: 7, title: '小吃店老闆不用再手寫單！\n免費掃碼點餐系統 StreetOrder', category: '工具介紹', slug: 'post-7' },
  { id: 8, title: '大樂透不再靠直覺亂選！\n免費大樂透 AI 預測器 4 大策略推薦', category: '工具介紹', slug: 'post-8' },
  { id: 9, title: '開完會什麼都忘？\n免費會議錄音神器 邊錄邊出逐字稿', category: '工具介紹', slug: 'post-9' },
  { id: 10, title: '2026 用 AI 賺錢的 5 種方法', category: 'AI 應用', slug: 'post-10' },
  { id: 11, title: '用 AI 打造自己的虛擬分身', category: '技術教學', slug: 'post-11' },
  { id: 13, title: '老闆最怕的就是\n知道短影音重要但又沒人拍', category: 'AI 應用', slug: 'post-13' },
  { id: 14, title: 'AI 新手必看！\n那些你常聽到卻看不懂的專有名詞全解析', category: '技術教學', slug: 'post-14' },
  { id: 15, title: '長網址貼出去醜到不想分享？\n免費縮短網址小工具', category: '工具介紹', slug: 'post-15' },
  { id: 16, title: '每天查農民曆查到煩？\n免費線上農民曆小工具', category: '工具介紹', slug: 'post-16' },
  { id: 17, title: '想把 YouTube 歌曲變成 iPhone 鈴聲？\n免費轉換小工具', category: '工具介紹', slug: 'post-17' },
  { id: 18, title: '我研究了四個 AI 影片創作工具\nAutoIP・HeyGen・Kling AI・即夢 AI', category: '工具介紹', slug: 'post-18' },
];

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(ctx, text, maxWidth, fontSize) {
  const lines = [];
  // Split by explicit newlines first
  const paragraphs = text.split('\n');
  for (const para of paragraphs) {
    const chars = [...para];
    let currentLine = '';
    for (const char of chars) {
      const testLine = currentLine + char;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
  }
  return lines;
}

function generateCover(post) {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  const config = CATEGORY_CONFIG[post.category] || CATEGORY_CONFIG['一般'];

  // === Background gradient ===
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, config.gradient[0]);
  grad.addColorStop(1, config.gradient[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // === Decorative elements ===
  // Large circle (top right)
  ctx.beginPath();
  ctx.arc(W - 120, -60, 280, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.fill();

  // Medium circle (bottom left)
  ctx.beginPath();
  ctx.arc(80, H + 40, 200, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.fill();

  // Diagonal accent line
  ctx.beginPath();
  ctx.moveTo(W - 400, 0);
  ctx.lineTo(W, 300);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Small dots pattern
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 3; j++) {
      ctx.beginPath();
      ctx.arc(W - 180 + i * 24, 420 + j * 24, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fill();
    }
  }

  // === Brand badge (top left) ===
  ctx.font = 'bold 16px "Microsoft JhengHei", "PingFang TC", sans-serif';
  const brandText = '老J AI 實驗室';
  const brandWidth = ctx.measureText(brandText).width + 32;

  drawRoundedRect(ctx, 60, 48, brandWidth, 36, 18);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.fillText(brandText, 76, 72);

  // === Category badge (top left, below brand) ===
  ctx.font = '14px "Microsoft JhengHei", "PingFang TC", sans-serif';
  const catText = `${config.emoji}  ${post.category}`;
  const catWidth = ctx.measureText(catText).width + 28;

  drawRoundedRect(ctx, 60, 100, catWidth, 30, 15);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fillText(catText, 74, 120);

  // === Main title — large, centered ===
  const titleLen = post.title.length;
  const titleFontSize = titleLen > 40 ? 48 : titleLen > 25 ? 54 : 60;
  ctx.font = `bold ${titleFontSize}px "Microsoft JhengHei", "PingFang TC", sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';

  const titleLines = wrapText(ctx, post.title, W - 160, titleFontSize);
  const lineHeight = titleFontSize * 1.4;
  const totalTextHeight = titleLines.length * lineHeight;

  let startY = (H - totalTextHeight) / 2 + titleFontSize * 0.35;

  for (let i = 0; i < titleLines.length; i++) {
    const y = startY + i * lineHeight;
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillText(titleLines[i], W / 2 + 2, y + 3);
    // Main text
    ctx.fillStyle = '#ffffff';
    ctx.fillText(titleLines[i], W / 2, y);
  }
  ctx.textAlign = 'start';

  // === Bottom accent bar (centered) ===
  const barW = 300;
  const barGrad = ctx.createLinearGradient((W - barW) / 2, 0, (W + barW) / 2, 0);
  barGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
  barGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
  barGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = barGrad;
  drawRoundedRect(ctx, (W - barW) / 2, H - 80, barW, 3, 1.5);
  ctx.fill();

  // === Bottom URL (centered) ===
  ctx.font = '15px "Microsoft JhengHei", "PingFang TC", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.textAlign = 'center';
  ctx.fillText('oldjailab.com', W / 2, H - 48);
  ctx.textAlign = 'start';

  return canvas;
}

// Generate all covers
console.log(`🎨 Generating ${POSTS.length} cover images...`);
for (const post of POSTS) {
  const canvas = generateCover(post);
  const filename = `cover-${post.id}.png`;
  const filepath = path.join(OUT_DIR, filename);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filepath, buffer);
  console.log(`  ✅ ${filename} (${post.title.split('\n')[0]})`);
}
console.log(`\n✨ Done! ${POSTS.length} covers saved to ${OUT_DIR}`);
