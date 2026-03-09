import React, { useEffect, useState } from 'react';
import { Music, Hash, Dices, Sparkles, Utensils, BookOpen, Lightbulb, Wrench,
         ArrowRight, Search, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SEO from '../components/SEO';

const ICON_MAP: Record<string, React.ReactNode> = {
  Music: <Music className="w-6 h-6" />,
  Dices: <Dices className="w-6 h-6" />,
  Hash: <Hash className="w-6 h-6" />,
  Sparkles: <Sparkles className="w-6 h-6" />,
  Utensils: <Utensils className="w-6 h-6" />,
  BookOpen: <BookOpen className="w-6 h-6" />,
  Lightbulb: <Lightbulb className="w-6 h-6" />,
  Wrench: <Wrench className="w-6 h-6" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  '內容創作': 'bg-violet-50 text-violet-600 border-violet-100',
  '數據分析': 'bg-blue-50 text-blue-600 border-blue-100',
  '命理占卜': 'bg-amber-50 text-amber-600 border-amber-100',
  '商業應用': 'bg-emerald-50 text-emerald-600 border-emerald-100',
  '生活效率': 'bg-rose-50 text-rose-600 border-rose-100',
  '學習資源': 'bg-orange-50 text-orange-600 border-orange-100',
};

/* ── Fallback defaults (when API fails) ──────────────────────────────────── */
const DEFAULT_TOOLS = [
  { url:'https://jshao-tubeflow.zeabur.app', title:'YT 音樂頻道 歌詞產生器', description:'輸入曲風與主題，AI 自動為你產出押韻且具備情感共鳴的歌詞，適合原創音樂頻道。', icon_name:'Music', category:'內容創作' },
  { url:'https://bingo-predictor.zeabur.app', title:'台灣彩券賓果賓果預測器', description:'透過歷史開獎數據與機率模型，輔助分析賓果賓果的熱門號碼與冷門號碼趨勢。', icon_name:'Dices', category:'數據分析' },
  { url:'https://lottery539.zeabur.app', title:'台灣彩券今彩539 號碼分析器', description:'整合今彩539歷期開獎紀錄，提供拖牌、連莊號等統計數據，幫助你制定選號策略。', icon_name:'Hash', category:'數據分析' },
  { url:'https://divination-jteam2026.zeabur.app', title:'紫微斗數 / 塔羅牌 / 每日星座', description:'結合東方命理與西方占星，提供每日運勢解析、塔羅抽牌與紫微命盤基礎排盤。', icon_name:'Sparkles', category:'命理占卜' },
  { url:'https://streetorder.zeabur.app', title:'餐飲業 點餐出單 小工具', description:'專為小型餐飲業設計的輕量級點餐系統，支援快速點單與營收統計。', icon_name:'Utensils', category:'商業應用' },
  { url:'https://keepspend.zeabur.app', title:'記帳日記', description:'結合日常隨筆與收支紀錄，輕鬆管理個人財務。', icon_name:'BookOpen', category:'生活效率' },
  { url:'https://jay-ai-tips.zeabur.app', title:'新手入門AI小技巧工具庫', description:'收錄最實用的 AI 詠唱指令 (Prompts) 與工作流教學，幫助新手快速掌握 AI 應用。', icon_name:'Lightbulb', category:'學習資源' },
];

const ALL = '全部';

const trackClick = (url: string, title: string) => {
  fetch('/api/analytics/click', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, title }),
  }).catch(() => {});
};

export default function Tools() {
  const [tools, setTools] = useState(DEFAULT_TOOLS);
  const [active, setActive] = useState(ALL);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetch('/api/tools')
      .then(r => r.ok ? r.json() : [])
      .then((data: any[]) => { if (data.length > 0) setTools(data); })
      .catch(() => {});
  }, []);

  const categories = [ALL, ...Array.from(new Set(tools.map(t => t.category)))];

  const filtered = tools.filter(t => {
    const matchCat = active === ALL || t.category === active;
    const q = query.toLowerCase();
    const matchQuery = !q || t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q);
    return matchCat && matchQuery;
  });

  /* JSON-LD: SoftwareApplication ItemList */
  const toolsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'AI 工具箱 — 老J AI 實驗室',
    description: '實驗室嚴選、親測有效的高效率 AI 工具。涵蓋內容創作、數據分析、商業應用、生活效率等分類。',
    url: 'https://www.oldjailab.com/tools',
    mainEntity: {
      '@type': 'ItemList',
      name: 'AI 工具列表',
      numberOfItems: tools.length,
      itemListElement: tools.map((t, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'SoftwareApplication',
          name: t.title,
          description: t.description,
          url: t.url,
          applicationCategory: t.category,
          operatingSystem: 'Web',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'TWD' },
        },
      })),
    },
  };

  return (
    <div className="py-12 px-6 max-w-6xl mx-auto">
      <SEO
        title="AI 工具箱 — 嚴選高效率 AI 變現工具"
        description="老J AI 實驗室嚴選、親測有效的 AI 工具：歌詞產生器、彩券分析、命理占卜、記帳日記、AI 教學等。立即免費使用，開始你的自動化變現工作流。"
        path="/tools"
        jsonLd={toolsJsonLd}
      />

      {/* Header */}
      <motion.header initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }} className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-3">AI 工具箱</h1>
        <p className="text-lg text-gray-500 max-w-2xl">實驗室嚴選、親測有效的高效率 AI 工具。點擊進入各個工具，立即開始你的自動化變現工作流。</p>
      </motion.header>

      {/* Search + Filter Bar */}
      <motion.div role="search" aria-label="搜尋與篩選工具" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.45, delay:0.1 }}
        className="flex flex-col sm:flex-row gap-4 mb-10">
        {/* Search */}
        <div className="relative flex-1">
          <Search aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <label htmlFor="tools-search" className="sr-only">搜尋工具</label>
          <input
            id="tools-search"
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="搜尋工具名稱或描述…"
            className="w-full pl-11 pr-5 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 text-sm bg-white transition-all"
          />
        </div>

        {/* Category Tabs */}
        <nav aria-label="工具分類篩選" className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
          <LayoutGrid className="w-4 h-4 text-gray-400 shrink-0 ml-1" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`relative shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                active === cat
                  ? 'text-white'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              {active === cat && (
                <motion.span layoutId="pill"
                  className="absolute inset-0 bg-slate-900 rounded-full -z-10"
                  transition={{ type:'spring', stiffness:400, damping:30 }} />
              )}
              {cat}
            </button>
          ))}
        </nav>
      </motion.div>

      {/* Grid */}
      <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? filtered.map((tool, i) => (
            <motion.a
              key={tool.url}
              layout
              initial={{ opacity:0, scale:0.93, y:16 }}
              animate={{ opacity:1, scale:1, y:0 }}
              exit={{ opacity:0, scale:0.93, y:8 }}
              transition={{ duration:0.35, delay: i * 0.05, ease:[0.16,1,0.3,1] }}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackClick(tool.url, tool.title)}
              className="group p-8 rounded-3xl border border-gray-100 hover:border-gray-300 hover:shadow-lg hover:-translate-y-1.5 transition-all bg-white flex flex-col h-full duration-300"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-[#1A1A1A] group-hover:bg-slate-900 group-hover:text-white transition-all duration-300 shadow-sm">
                  {ICON_MAP[tool.icon_name] ?? <LayoutGrid className="w-6 h-6" />}
                </div>
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${CATEGORY_COLORS[tool.category] || 'bg-gray-100 text-gray-600 border-gray-100'}`}>
                  {tool.category}
                </span>
              </div>
              <h3 className="text-lg font-bold mb-3 group-hover:text-[#1E3A8A] transition-colors">{tool.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1">{tool.description}</p>
              <div className="text-sm font-semibold flex items-center gap-1.5 text-slate-900 group-hover:text-[#1E3A8A] group-hover:gap-2.5 transition-all mt-auto">
                開始使用 <ArrowRight className="w-4 h-4" />
              </div>
            </motion.a>
          )) : (
            <motion.div key="empty" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="col-span-full py-20 text-center text-gray-400">
              <LayoutGrid className="w-10 h-10 mx-auto mb-4 opacity-30" />
              <p className="font-medium">找不到符合條件的工具</p>
              <p className="text-sm mt-1">試試其他搜尋關鍵字或分類</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {filtered.length > 0 && (
        <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}
          className="text-center text-xs text-gray-400 mt-10">
          顯示 {filtered.length} / {tools.length} 個工具
        </motion.p>
      )}
    </div>
  );
}
