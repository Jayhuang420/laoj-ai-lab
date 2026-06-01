# 變更紀錄

## [2026-06-02] — Email 深色模式、Notion 名單分流、表單精簡

### Email 深色模式修正（commit 3b1cce6）
- 免費指南交付信強制淺色配色，避免 iPhone（Apple Mail）深色模式反轉白底
- 加 `<meta name="supported-color-schemes" content="light">`、`:root{color-scheme:only light}`
  與 `@media (prefers-color-scheme:dark)` 媒體查詢；`<body>` 補 `color-scheme:only light`

### Notion 名單改寫入「課程銷售名單」三表（commit 3b1cce6 官網 / 73d9f97 銷售站）
- 新建母分類頁「🎓 課程銷售名單」，下含三張各自獨立的表：
  - 免費領取名單（官網 `/api/subscribe` + 銷售站 `/api/portaly-lead` 共用，以「來源」區分）
  - $490 自學版訂單（銷售站 `bank-order` plan=self）
  - $3,888 完整版訂單（銷售站 `bank-order` plan=full/upgrade）
- 名單與訂單 schema 對齊：統一加「時間」屬性；移除舊「方案/興趣分群/備註」欄位
- 官網 `NOTION_SUBSCRIBERS_DB_ID` 指向新「免費領取名單」，日期屬性「訂閱時間」→「時間」

### 免費指南表單精簡（commit b73b111）
- 移除「聯絡電話」欄位；改為「稱呼（必填）＋ Email（必填）」
- 前端加 Email 格式檢查；`/api/subscribe` 後端 Email 改為必填（移除電話擇一/純電話分支）

### 部署備註
- 以上皆經 `develop → main`（快轉，非 force）部署
- 部署時再次遇 Zeabur「映像拉取失敗（ImagePull）」；Zeabur 客服確認為映像 registry 下載映像層的
  上游網路短暫逾時、與程式/主機無關，資料磁碟（獨立 volume）不受影響，重新部署即可恢復

## [2026-06-01] — 品牌音樂化改版上線

### SEO 修復（commit 6d62d52）
- 文章頁 SSR：catch-all 對 `/blog/:slug` 的 slug 先 `decodeURIComponent` 再查 DB
  - 修正：中文 slug 文章原本 `req.path` 為百分比編碼、對不上 DB → 退回空殼、無 SSR meta/內文/Article JSON-LD
  - 修正後文章頁有正確 `<title>`、描述、og:type=article、BlogPosting 結構化資料、`<noscript>` 內文
- 移除靜態 `public/sitemap.xml`，改用既有的動態 `/sitemap.xml` 路由（含全部已發布文章，目前 37 篇）
- 已於 Google Search Console 重新提交 `https://www.oldjailab.com/sitemap.xml`

### 關於頁簡介（commit 72fa6ad，程式碼預設層）
- 標題/自介：「操盤百億的零售高管」→「操盤管理 12 間門市」；移除「營收上億/百億」字樣
- 時間軸頻道起始年改為 2025

### 後台 DB 內容更新為「AI 音樂頻道」定位（透過後台內容管理）
- 首頁：Hero、Lead Magnet、熱門工具區塊、數據統計、底部 CTA 全部換成音樂頻道新文案
  - Hero 標題「不露臉、不唱歌、不懂樂理 / 用 AI 打造會自動賺錢的音樂頻道」
  - 數據改為 30 天開通營利 / 月被動分潤 2 萬+ / 單曲最高觀看 3 萬+
  - 移除 Hero 照片標章「AI 變現實戰家」（photoBadge 清空）
- 關於頁 intro：角色改「AI 音樂頻道變現實戰家」、標題與三段自介更新；頭像改用 `/images/hero-profile.jpg`（工作室新照）

### 首頁精簡（commit 6321a97）
- 照片標章改為「僅在有文字時渲染」，避免 photoBadge 為空時殘留白色小點
- 移除「最新文章」區塊
- 移除「用 AI 打造你的第一個被動收入」電子書 Banner
- 移除「免費 AI 工具箱」區塊

### 部署備註
- 以上皆經 `develop → main`（快轉，非 force）部署，Zeabur 自動建置
- `6321a97` 部署時遇 Zeabur「映像拉取失敗（ImagePull）」平台暫時性故障；本機 build 正常，重新部署即恢復

## [Unreleased]
- 初始化三層環境架構 (develop/staging/production)
- 建立 /doc/ AI 文件結構
