import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Email-safe section title using <table> instead of flexbox
const sectionTitle = (num: string, text: string) =>
  `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:14px"><tr>
    <td width="38" valign="top" style="width:38px;padding-right:10px">
      <span class="sec-num" style="display:inline-block;width:28px;height:28px;background:#1e3a8a;color:#ffffff;font-size:12px;font-weight:700;border-radius:8px;text-align:center;line-height:28px;font-family:Arial,sans-serif">${num}</span>
    </td>
    <td valign="middle">
      <strong class="sec-title" style="font-size:18px;font-weight:800;color:#0f172a;line-height:1.4">${text}</strong>
    </td>
  </tr></table>`;

// Email-safe step item using <table> instead of flexbox
const step = (letter: string, title: string, body: string) =>
  `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:20px"><tr>
    <td width="46" valign="top" style="width:46px;padding-right:14px">
      <span class="step-num" style="display:inline-block;width:32px;height:32px;background:#1e3a8a;color:#ffffff;font-size:13px;font-weight:700;border-radius:50%;text-align:center;line-height:32px;font-family:Arial,sans-serif">${letter}</span>
    </td>
    <td valign="top">
      <div class="step-title" style="font-weight:700;font-size:14px;color:#0f172a;margin-bottom:6px">${title}</div>
      <div class="step-body" style="font-size:13px;color:#374151;line-height:1.7">${body}</div>
    </td>
  </tr></table>`;

function ebookHtml(email: string): string {
  const appUrl = process.env.APP_URL || 'https://laoj.ai';
  return `<!DOCTYPE html>
<html lang="zh-TW" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="color-scheme" content="light dark"/>
<meta name="supported-color-schemes" content="light dark"/>
<title>《2026 AI 變現全景地圖》</title>
<style>
  :root{color-scheme:light dark;}
  *{margin:0;padding:0;box-sizing:border-box;}
  body{background:#f4f4f0;font-family:'Helvetica Neue',Arial,'PingFang TC','Microsoft JhengHei',sans-serif;color:#1a1a1a;}
  .wrap{max-width:680px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 40px rgba(0,0,0,.08);}
  .cover{background:linear-gradient(135deg,#0f172a 0%,#1e3a8a 60%,#1d4ed8 100%);padding:56px 40px 48px;text-align:center;}
  .cover-badge{display:inline-block;background:rgba(255,255,255,.15);color:#93c5fd;font-size:11px;font-weight:700;letter-spacing:2px;padding:6px 14px;border-radius:100px;margin-bottom:24px;text-transform:uppercase;}
  .cover-title{color:#ffffff;font-size:32px;font-weight:800;line-height:1.2;margin-bottom:10px;}
  .cover-sub{color:#93c5fd;font-size:15px;margin-bottom:32px;}
  .cover-divider{width:48px;height:3px;background:linear-gradient(90deg,#60a5fa,#818cf8);border-radius:2px;margin:0 auto 28px;}
  .cover-meta{color:rgba(255,255,255,.6);font-size:12px;}
  .body{padding:40px;background:#ffffff;}
  .greeting{font-size:15px;color:#374151;margin-bottom:28px;line-height:1.7;}
  .greeting strong{color:#1e3a8a;}
  .section{margin-bottom:36px;}
  .section-body{font-size:14px;color:#374151;line-height:1.8;}
  .box{background:#f0f6ff;border-left:4px solid #1e3a8a;border-radius:0 10px 10px 0;padding:16px 20px;margin:16px 0;}
  .box-title{font-weight:700;color:#1e3a8a;margin-bottom:8px;font-size:13px;}
  .tool-item{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px 14px;margin-bottom:10px;}
  .tool-name{font-weight:700;font-size:13px;color:#0f172a;margin-bottom:3px;}
  .tool-desc{font-size:11px;color:#64748b;}
  .tool-tag{display:inline-block;background:#dbeafe;color:#1e3a8a;font-size:10px;font-weight:600;padding:2px 8px;border-radius:100px;margin-top:6px;}
  .strategy{background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:18px;margin-bottom:12px;}
  .strategy-emoji{font-size:22px;margin-bottom:8px;}
  .strategy-title{font-weight:700;font-size:14px;color:#0f172a;margin-bottom:6px;}
  .strategy-body{font-size:13px;color:#374151;line-height:1.7;}
  .cta-wrap{background:linear-gradient(135deg,#0f172a,#1e3a8a);border-radius:14px;padding:36px;text-align:center;margin-top:8px;}
  .cta-title{color:#ffffff;font-size:20px;font-weight:800;margin-bottom:10px;}
  .cta-sub{color:#93c5fd;font-size:13px;margin-bottom:24px;line-height:1.6;}
  .cta-btn{display:inline-block;background:#ffffff;color:#1e3a8a;font-weight:700;font-size:14px;padding:14px 32px;border-radius:100px;text-decoration:none;}
  .footer{background:#f8fafc;padding:28px 40px;text-align:center;border-top:1px solid #e2e8f0;}
  .footer p{font-size:11px;color:#94a3b8;line-height:1.8;}
  .footer a{color:#60a5fa;text-decoration:none;}
  ul.list{padding-left:22px;margin-top:8px;list-style-type:disc;}
  ul.list li{font-size:13px;color:#374151;margin-bottom:6px;line-height:1.6;list-style-type:disc;}
  .tag{display:inline-block;background:#f1f5f9;color:#475569;font-size:11px;font-weight:600;padding:4px 10px;border-radius:100px;margin-top:10px;}
  .divider{border:none;border-top:1px solid #f1f5f9;margin:32px 0;}
  @media only screen and (max-width:480px){
    .wrap{margin:0;border-radius:0;}
    .cover{padding:36px 24px 32px;}
    .cover-title{font-size:24px;}
    .body{padding:28px 20px;}
    .footer{padding:20px;}
    .cta-wrap{padding:28px 20px;}
  }
  /* ─── Dark Mode (Apple Mail, iOS Mail, Outlook iOS) ─── */
  @media (prefers-color-scheme:dark){
    body{background:#111318 !important;color:#e2e8f0 !important;}
    .wrap{background:#1a1d27 !important;box-shadow:0 4px 40px rgba(0,0,0,.4) !important;}
    .body{background:#1a1d27 !important;}
    .greeting{color:#cbd5e1 !important;}
    .greeting strong{color:#93c5fd !important;}
    .section-body{color:#cbd5e1 !important;}
    .section-body p{color:#cbd5e1 !important;}
    .section-body strong{color:#e2e8f0 !important;}
    .box{background:#1e293b !important;border-left-color:#3b82f6 !important;}
    .box-title{color:#93c5fd !important;}
    ul.list li{color:#cbd5e1 !important;}
    ul.list li strong{color:#e2e8f0 !important;}
    .tool-item{background:#1e293b !important;border-color:#334155 !important;}
    .tool-name{color:#f1f5f9 !important;}
    .tool-desc{color:#94a3b8 !important;}
    .tool-tag{background:#1e3a5f !important;color:#93c5fd !important;}
    .strategy{background:#1e293b !important;border-color:#334155 !important;}
    .strategy-title{color:#f1f5f9 !important;}
    .strategy-body{color:#cbd5e1 !important;}
    .strategy-body strong{color:#e2e8f0 !important;}
    .cta-wrap{background:linear-gradient(135deg,#0c1220,#162d6b) !important;}
    .cta-btn{background:#ffffff !important;color:#1e3a8a !important;}
    .footer{background:#141720 !important;border-top-color:#2d3548 !important;}
    .footer p{color:#64748b !important;}
    .footer a{color:#60a5fa !important;}
    .tag{background:#1e293b !important;color:#94a3b8 !important;}
    .divider{border-top-color:#2d3548 !important;}
    h1,h2,h3,h4,h5,h6{color:#f1f5f9 !important;}
    .sec-num{background:#2563eb !important;color:#ffffff !important;}
    .sec-title{color:#f1f5f9 !important;}
    .step-num{background:#2563eb !important;color:#ffffff !important;}
    .step-title{color:#f1f5f9 !important;}
    .step-body{color:#cbd5e1 !important;}
    .step-body strong{color:#e2e8f0 !important;}
    .box-green{background:#132b1a !important;border-left-color:#22c55e !important;}
    .box-green .box-title{color:#4ade80 !important;}
  }
</style>
<!--[if mso]><style>body{background:#f4f4f0!important;}</style><![endif]-->
</head>
<body>
<div class="wrap">

  <!-- Cover -->
  <div class="cover">
    <div class="cover-badge">限時免費電子書 · 2026版</div>
    <div class="cover-title">《2026 AI 變現全景地圖》</div>
    <div class="cover-sub">從 0 到 1，打造高獲利一人 AI 事業</div>
    <div class="cover-divider"></div>
    <div class="cover-meta">老 J AI 實驗室 出品 · 12年+ 零售業高階主管親測</div>
  </div>

  <!-- Body -->
  <div class="body">

    <p class="greeting">
      嗨！感謝你訂閱 <strong>老 J AI 實驗室</strong>。<br/>
      這份《2026 AI 變現全景地圖》是我花了數個月整理，結合親身實戰驗證的完整指南。不談空泛理論，只給你<strong>立即可執行的行動方案</strong>。
    </p>

    <!-- Section 1 -->
    <div class="section">
      ${sectionTitle('1', '2026 AI 變現核心思維')}
      <div class="section-body">
        <p>2026 年，AI 工具已不再是「加分項」，而是<strong>一人公司生存的基本門檻</strong>。關鍵不在於你用了多少 AI，而在於你是否用 AI 建立了一套可複製的<strong>獲利系統</strong>。</p>
        <div class="box">
          <div class="box-title">🔑 三大核心原則</div>
          <ul class="list">
            <li><strong>精實驗證優先</strong> — 先用最小成本測試市場需求，再投入大量資源</li>
            <li><strong>PLG（產品主導增長）</strong> — 讓產品本身帶來用戶，降低獲客成本</li>
            <li><strong>自動化即護城河</strong> — 把你的最佳流程固化成工作流，讓 AI 24小時運轉</li>
          </ul>
        </div>
      </div>
    </div>

    <hr class="divider"/>

    <!-- Section 2 -->
    <div class="section">
      ${sectionTitle('2', 'AI 變現路徑圖：5 條主要跑道')}
      <div class="section-body">
        <p>根據技能背景與資源狀況，你可以選擇最適合自己的切入點：</p>
        <div style="margin-top:14px">
          <div class="strategy">
            <div class="strategy-emoji">✍️</div>
            <div class="strategy-title">跑道 A｜AI 內容變現</div>
            <div class="strategy-body">用 AI 規模化產出內容（YouTube、Podcast、部落格），透過廣告、贊助、課程銷售獲利。<strong>門檻最低</strong>，適合從 0 開始的人。</div>
          </div>
          <div class="strategy">
            <div class="strategy-emoji">🛠️</div>
            <div class="strategy-title">跑道 B｜AI 工具＆服務外包</div>
            <div class="strategy-body">為中小企業提供 AI 流程導入服務（自動化報告、客服機器人、數據分析），每月固定收費。<strong>高利潤、高黏著度</strong>。</div>
          </div>
          <div class="strategy">
            <div class="strategy-emoji">🎓</div>
            <div class="strategy-title">跑道 C｜AI 知識產品</div>
            <div class="strategy-body">打包你的 AI 使用心法成線上課程、電子書、Prompt 資料庫。<strong>一次製作，持續被動收入</strong>。</div>
          </div>
          <div class="strategy">
            <div class="strategy-emoji">🤖</div>
            <div class="strategy-title">跑道 D｜AI Agent ＆ 自動化</div>
            <div class="strategy-body">建立能自主完成任務的 AI Agent，提供給企業或個人訂閱使用。<strong>技術門檻較高</strong>，但競爭壁壘也最高。</div>
          </div>
          <div class="strategy">
            <div class="strategy-emoji">🏪</div>
            <div class="strategy-title">跑道 E｜AI 輔助電商＆選品</div>
            <div class="strategy-body">用 AI 做選品分析、商品文案、廣告優化，搭配電商平台（蝦皮、Shopee）快速起量。<strong>老 J 最熟悉的跑道</strong>。</div>
          </div>
        </div>
      </div>
    </div>

    <hr class="divider"/>

    <!-- Section 3 -->
    <div class="section">
      ${sectionTitle('3', '必備 AI 工具清單（2026 精選）')}
      <div class="section-body">
        <p>不需要用所有工具，根據你的跑道選擇最適合的組合：</p>
        <div style="margin-top:14px">
          <div class="tool-item"><div class="tool-name">ChatGPT / Claude</div><div class="tool-desc">核心大腦，文案、策略、分析</div><span class="tool-tag">所有跑道必備</span></div>
          <div class="tool-item"><div class="tool-name">Midjourney / Flux</div><div class="tool-desc">AI 圖像生成，品牌視覺</div><span class="tool-tag">內容 / 電商</span></div>
          <div class="tool-item"><div class="tool-name">Make / n8n</div><div class="tool-desc">無代碼自動化工作流平台</div><span class="tool-tag">自動化必備</span></div>
          <div class="tool-item"><div class="tool-name">Notion AI</div><div class="tool-desc">知識管理 + AI 寫作協作</div><span class="tool-tag">知識產品</span></div>
          <div class="tool-item"><div class="tool-name">ElevenLabs</div><div class="tool-desc">AI 聲音複製，Podcast / 影片配音</div><span class="tool-tag">內容創作</span></div>
          <div class="tool-item"><div class="tool-name">Perplexity AI</div><div class="tool-desc">即時網路 AI 搜尋，市場調研</div><span class="tool-tag">選品 / 策略</span></div>
          <div class="tool-item"><div class="tool-name">Dify / Flowise</div><div class="tool-desc">自建 AI Agent 與知識庫</div><span class="tool-tag">Agent 跑道</span></div>
          <div class="tool-item"><div class="tool-name">Canva AI</div><div class="tool-desc">快速設計，社群素材批量產出</div><span class="tool-tag">內容 / 電商</span></div>
        </div>
        <span class="tag">💡 老 J 建議：先精通 2-3 個，再橫向擴展</span>
      </div>
    </div>

    <hr class="divider"/>

    <!-- Section 4 -->
    <div class="section">
      ${sectionTitle('4', '3 個立即可執行的自動化工作流')}
      <div class="section-body">
        ${step('A', '社群內容自動化流水線', '工具：ChatGPT → Canva API → Buffer<br/>流程：每天自動生成 3 個社群貼文草稿 → AI 配圖 → 排程發布。<br/><strong>節省時間：每週省下 6-8 小時</strong>的內容製作時間。')}
        ${step('B', '電商選品情報自動推送', '工具：Make + Perplexity API + Gmail<br/>流程：每天抓取蝦皮熱銷榜 → AI 分析競品價格與評論 → 自動寄送選品報告到你的信箱。<br/><strong>節省時間：省下每天 1-2 小時的人工蒐集</strong>。')}
        ${step('C', '客戶詢問 AI 自動回覆系統', '工具：Dify + LINE Messaging API + 知識庫<br/>流程：把你的 FAQ、產品資訊餵給 AI → 客戶在 LINE 上詢問時自動秒回 → 超出範圍才轉人工。<br/><strong>效果：客服效率提升 80%，平均回覆時間 &lt;30 秒</strong>。')}
      </div>
    </div>

    <hr class="divider"/>

    <!-- Section 5 -->
    <div class="section">
      ${sectionTitle('5', '老 J 親測有效的選品策略')}
      <div class="section-body">
        <div class="box">
          <div class="box-title">📊 選品黃金三角評估法</div>
          <ul class="list">
            <li><strong>需求強度</strong> — 用 Perplexity / Google Trends 確認每月搜尋量 &gt; 10,000</li>
            <li><strong>競爭密度</strong> — 蝦皮同類商品 &lt; 500 件，或前 10 名評論數 &lt; 200</li>
            <li><strong>利潤空間</strong> — 毛利率至少 40%，扣除廣告費後淨利 &gt; 20%</li>
          </ul>
        </div>
        <p style="margin-top:12px;font-size:13px;color:#374151;line-height:1.7;">
          這三個條件同時滿足，勝率超過 70%。我在 12 年零售主管生涯中測試過數百個品項，這套方法讓我把新品失敗率從 60% 降到 25% 以下。
        </p>
        <div class="box box-green" style="margin-top:14px;background:#f0fdf4;border-left-color:#16a34a;">
          <div class="box-title" style="color:#16a34a;">✅ 2026 推薦熱門品類（AI 輔助選品）</div>
          <ul class="list">
            <li>AI 週邊配件（AI Pin、智慧音箱配件）</li>
            <li>健康科技產品（穿戴裝置、睡眠追蹤）</li>
            <li>一人辦公室設備（人體工學、居家工作周邊）</li>
            <li>寵物科技（自動餵食器、寵物監控）</li>
          </ul>
        </div>
      </div>
    </div>

    <hr class="divider"/>

    <!-- CTA -->
    <div class="cta-wrap">
      <div class="cta-title">準備好開始你的 AI 變現之路了嗎？</div>
      <div class="cta-sub">
        老 J AI 實驗室持續更新最新的 AI 工具評測、實戰案例與變現策略。<br/>
        歡迎到官網探索更多 AI 工具與資源。
      </div>
      <a href="${appUrl}" class="cta-btn">前往 老 J AI 實驗室 →</a>
    </div>

  </div>

  <!-- Footer -->
  <div class="footer">
    <p>
      你收到這封信，是因為你在 <a href="${appUrl}">老 J AI 實驗室</a> 訂閱了《AI 變現全景地圖》。<br/>
      發送至：${email}<br/><br/>
      © 2026 老 J AI 實驗室 · 保留所有權利
    </p>
  </div>

</div>
</body>
</html>`;
}

/* ── Inquiry Confirmation Email ────────────────────────────────────────────── */
function inquiryConfirmationHtml(name: string): string {
  const appUrl = process.env.APP_URL || 'https://laoj.ai';
  return `<!DOCTYPE html>
<html lang="zh-TW"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>諮詢已收到</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{background:#f4f4f0;font-family:'Helvetica Neue',Arial,'PingFang TC','Microsoft JhengHei',sans-serif;color:#1a1a1a;}
  .wrap{max-width:600px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 40px rgba(0,0,0,.08);}
  .header{background:linear-gradient(135deg,#0f172a,#1e3a8a);padding:40px;text-align:center;}
  .header h1{color:#fff;font-size:24px;font-weight:800;}
  .header p{color:#93c5fd;font-size:13px;margin-top:8px;}
  .body{padding:36px 40px;}
  .body p{font-size:14px;color:#374151;line-height:1.8;margin-bottom:16px;}
  .body strong{color:#0f172a;}
  .highlight{background:#f0f6ff;border-left:4px solid #1e3a8a;border-radius:0 10px 10px 0;padding:16px 20px;margin:20px 0;}
  .highlight p{margin:0;font-size:13px;}
  .cta{text-align:center;margin:28px 0 8px;}
  .cta a{display:inline-block;background:#0f172a;color:#fff;padding:14px 32px;border-radius:100px;font-weight:700;font-size:14px;text-decoration:none;}
  .footer{background:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e2e8f0;}
  .footer p{font-size:11px;color:#94a3b8;line-height:1.8;}
  .footer a{color:#60a5fa;text-decoration:none;}
  @media(max-width:480px){.wrap{margin:0;border-radius:0;}.header,.body{padding:28px 20px;}.footer{padding:20px;}}
</style></head><body>
<div class="wrap">
  <div class="header">
    <h1>感謝您的諮詢！</h1>
    <p>老 J AI 實驗室 已收到您的合作需求</p>
  </div>
  <div class="body">
    <p>${name} 您好，</p>
    <p>感謝您對 <strong>老 J AI 實驗室</strong> 的信任！我們已收到您的合作諮詢，會在 <strong>1-2 個工作天內</strong> 回覆您。</p>
    <div class="highlight">
      <p><strong>接下來的流程：</strong></p>
      <p>1. 老 J 會親自閱讀您的需求<br/>2. 安排合適的時段與您溝通<br/>3. 提供量身定制的 AI 解決方案</p>
    </div>
    <p>在等待回覆的期間，歡迎先瀏覽我們的 AI 工具箱，探索更多實用工具。</p>
    <div class="cta">
      <a href="${appUrl}/tools">探索 AI 工具箱 →</a>
    </div>
  </div>
  <div class="footer">
    <p>此信件由 <a href="${appUrl}">老 J AI 實驗室</a> 自動發送<br/>© ${new Date().getFullYear()} 老 J AI 實驗室 · 保留所有權利</p>
  </div>
</div></body></html>`;
}

export async function sendInquiryConfirmation(to: string, name: string): Promise<void> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS ||
      process.env.SMTP_USER === 'your@gmail.com') {
    console.warn('[mailer] SMTP 未設定，跳過寄送確認信。');
    return;
  }
  const fromName = process.env.SMTP_FROM_NAME || '老 J AI 實驗室';
  await transporter.sendMail({
    from: `"${fromName}" <${process.env.SMTP_USER}>`,
    to,
    subject: '✅ 我們已收到您的諮詢 — 老 J AI 實驗室',
    html: inquiryConfirmationHtml(name),
  });
  console.log(`[mailer] 諮詢確認信已寄送至 ${to}`);
}

/* ── Admin Notification Email ─────────────────────────────────────────────── */
interface InquiryInfo {
  name: string;
  email: string;
  company: string;
  service_type: string;
  budget: string;
  message: string;
}

export async function sendAdminNotification(inquiry: InquiryInfo): Promise<void> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS ||
      process.env.SMTP_USER === 'your@gmail.com') {
    console.warn('[mailer] SMTP 未設定，跳過管理員通知。');
    return;
  }
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
  const fromName = process.env.SMTP_FROM_NAME || '老 J AI 實驗室';

  const html = `<!DOCTYPE html>
<html lang="zh-TW"><head><meta charset="UTF-8"/></head><body style="font-family:Arial,sans-serif;background:#f8fafc;padding:20px;">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
  <div style="background:#0f172a;color:#fff;padding:24px 32px;">
    <h2 style="margin:0;font-size:18px;">🔔 新合作諮詢通知</h2>
  </div>
  <div style="padding:28px 32px;">
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:10px 0;color:#6b7280;width:100px;vertical-align:top;">姓名</td><td style="padding:10px 0;font-weight:700;">${inquiry.name}</td></tr>
      <tr><td style="padding:10px 0;color:#6b7280;vertical-align:top;">Email</td><td style="padding:10px 0;"><a href="mailto:${inquiry.email}" style="color:#1e3a8a;">${inquiry.email}</a></td></tr>
      <tr><td style="padding:10px 0;color:#6b7280;vertical-align:top;">公司</td><td style="padding:10px 0;">${inquiry.company || '未填寫'}</td></tr>
      <tr><td style="padding:10px 0;color:#6b7280;vertical-align:top;">服務類型</td><td style="padding:10px 0;"><span style="background:#dbeafe;color:#1e3a8a;padding:2px 10px;border-radius:100px;font-size:12px;font-weight:600;">${inquiry.service_type}</span></td></tr>
      <tr><td style="padding:10px 0;color:#6b7280;vertical-align:top;">預算</td><td style="padding:10px 0;">${inquiry.budget || '未填寫'}</td></tr>
      <tr><td style="padding:10px 0;color:#6b7280;vertical-align:top;">訊息</td><td style="padding:10px 0;line-height:1.7;white-space:pre-wrap;">${inquiry.message}</td></tr>
    </table>
    <div style="margin-top:24px;text-align:center;">
      <a href="${process.env.APP_URL || 'https://laoj.ai'}/admin" style="display:inline-block;background:#0f172a;color:#fff;padding:12px 28px;border-radius:100px;font-weight:700;font-size:13px;text-decoration:none;">前往後台管理 →</a>
    </div>
  </div>
</div></body></html>`;

  await transporter.sendMail({
    from: `"${fromName}" <${process.env.SMTP_USER}>`,
    to: adminEmail,
    subject: `[老J AI 實驗室] 新合作諮詢 — ${inquiry.name}`,
    html,
  });
  console.log(`[mailer] 管理員通知已寄送至 ${adminEmail}`);
}

/* ── Ebook Email ──────────────────────────────────────────────────────────── */
export async function sendEbookEmail(to: string): Promise<void> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS ||
      process.env.SMTP_USER === 'your@gmail.com') {
    console.warn('[mailer] SMTP 未設定，跳過寄信。請在 .env 填入 SMTP_USER 與 SMTP_PASS。');
    return;
  }

  const fromName = process.env.SMTP_FROM_NAME || '老 J AI 實驗室';

  await transporter.sendMail({
    from: `"${fromName}" <${process.env.SMTP_USER}>`,
    to,
    subject: '🎁 《2026 AI 變現全景地圖》已送達 — 老 J AI 實驗室',
    html: ebookHtml(to),
  });

  console.log(`[mailer] 電子書已寄送至 ${to}`);
}
