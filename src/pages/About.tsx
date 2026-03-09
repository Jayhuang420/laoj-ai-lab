import React, { useEffect, useState } from 'react';
import { CheckCircle2, Briefcase, Rocket, Bot, Users, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

/* ── Defaults (fallback when API has no data) ─────────────────────────────── */
const DEFAULTS = {
  intro: {
    name: '老 J',
    role: 'AI 實驗室創辦人',
    headline: '從教學影片設計師\n到 AI 自動化一人公司',
    bio: [
      '我深知在資源有限的情況下，如何將未經證實的點子轉化為具備「產品市場媒合度（PMF）」的可規模化業務。',
      '老 J AI 實驗室的成立，是為了分享那些我親身實踐過、真正能降低成本並帶來收益的 AI 工作流。我們拒絕虛榮功能，只專注於解決剛需。',
    ],
  },
  skills: {
    items: [
      { name: '精實創業 / MVP 思維', percentage: 95 },
      { name: 'AI 工作流自動化', percentage: 90 },
      { name: '零售 & 電商品牌策略', percentage: 88 },
      { name: 'PLG 商業化路徑設計', percentage: 82 },
      { name: 'Prompt Engineering', percentage: 85 },
    ],
  },
  principles: {
    items: [
      { title: '問題導向', description: '拒絕虛榮功能。在回答任何建議前，必須先驗證這是否解決了客戶的「剛需」。' },
      { title: '具體可執行', description: '所有的建議必須包含具體的行動步驟、推薦的 AI 協作工具或自動化工作流。' },
      { title: '0 到 1 的速度感', description: '優先考慮 MVP 路徑，強調透過快速迭代獲取市場反饋，而非追求一次性的完美。' },
    ],
  },
  timeline: {
    items: [
      { year: '2011–2018', title: '零售業高階管理', description: '加入連鎖零售集團，從門市主管一路晉升至區域總監，操盤 150+ 門市、帶領 500+ 人團隊，年營收逾百億。' },
      { year: '2018–2022', title: '電商暨品牌數位轉型', description: '主導集團電商業務從零打造，整合 O2O 策略，打通線下數據鏈路，帶動整體業績年成長 40%+。' },
      { year: '2022–2024', title: '投入 AI 工具開發', description: '開始研究 GPT、Claude 等大型語言模型的商業應用，建立多個自動化工作流，驗證 AI 變現可行性。' },
      { year: '2024–Now', title: '老 J AI 實驗室創立', description: '整合 12 年管理實戰與 AI 開發經驗，打造「老 J AI 實驗室」，聚焦一人公司 AI 化與 PLG 商業化路徑。' },
    ],
  },
};

const TIMELINE_ICONS: React.ReactNode[] = [
  <Briefcase className="w-5 h-5" />,
  <Users className="w-5 h-5" />,
  <Bot className="w-5 h-5" />,
  <Rocket className="w-5 h-5" />,
];

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
};

export default function About() {
  const [content, setContent] = useState<Record<string, any>>({});

  useEffect(() => {
    fetch('/api/content/about').then(r => r.ok ? r.json() : {}).then(setContent).catch(() => {});
  }, []);

  const intro = { ...DEFAULTS.intro, ...content.intro };
  const skills = content.skills?.items ? content.skills : DEFAULTS.skills;
  const principles = content.principles?.items ? content.principles : DEFAULTS.principles;
  const timeline = content.timeline?.items ? content.timeline : DEFAULTS.timeline;

  /* JSON-LD: ProfilePage + Person */
  const aboutJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: '老J',
      alternateName: 'Old J',
      jobTitle: 'AI 實驗室創辦人',
      description: '12年零售業高階管理經驗，專注 AI 自動化變現與一人公司商業化路徑設計。從百億級連鎖品牌操盤到 AI 自動化一人公司。',
      url: 'https://www.oldjailab.com/about',
      worksFor: {
        '@type': 'Organization',
        name: '老J AI 實驗室',
        url: 'https://www.oldjailab.com',
      },
      knowsAbout: ['AI 自動化', '精實創業', 'PLG 商業化', 'Prompt Engineering', '零售管理', '電商策略'],
      sameAs: ['https://twitter.com/laojailab', 'https://youtube.com/@laojailab'],
    },
  };

  return (
    <article className="py-20 px-6 max-w-6xl mx-auto">
      <SEO
        title="關於老J — 從零售高管到 AI 自動化創業者"
        description="老J：12年零售業高階管理經驗，從百億級連鎖品牌操盤到 AI 自動化一人公司。專注精實創業、AI 工作流自動化、PLG 商業化路徑設計。"
        path="/about"
        jsonLd={aboutJsonLd}
      />

      {/* ── Intro ─────────────────────────────────────────────────────────────── */}
      <section aria-label="個人簡介" className="grid md:grid-cols-2 gap-16 items-start mb-24">
        <motion.div initial="initial" animate="animate"
          variants={{ initial:{opacity:0}, animate:{opacity:1,transition:{staggerChildren:0.1,delayChildren:0.1}} }}>
          <motion.p variants={fadeInUp} className="text-xs font-bold tracking-widest text-emerald-600 uppercase mb-4">About Old J</motion.p>
          <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl font-bold tracking-tight mb-8 leading-tight">
            {(intro.headline || '從教學影片設計師\n到 AI 自動化一人公司').split('\n').map((line: string, i: number, arr: string[]) => (
              <React.Fragment key={i}>
                {line}
                {i < arr.length - 1 && <br />}
              </React.Fragment>
            ))}
          </motion.h1>
          {intro.bio.map((p: string, i: number) => (
            <motion.p key={i} variants={fadeInUp} className="text-lg text-gray-600 mb-6 leading-relaxed">
              {p}
            </motion.p>
          ))}

          {/* Skills — Animated Circular Chips */}
          <motion.div variants={fadeInUp} className="mt-6 relative">
            <svg className="absolute w-0 h-0" aria-hidden="true">
              <defs>
                <linearGradient id="skill-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="flex flex-wrap gap-3">
              {skills.items.map((s: any, i: number) => {
                const r = 18;
                const c = 2 * Math.PI * r;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ y: -4, scale: 1.04 }}
                    className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-200 transition-all cursor-default"
                  >
                    <div className="relative w-10 h-10 shrink-0">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
                        <circle cx="20" cy="20" r={r} fill="none" stroke="#f1f5f9" strokeWidth="2.5" />
                        <motion.circle
                          cx="20" cy="20" r={r} fill="none"
                          stroke="url(#skill-grad)"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeDasharray={c}
                          initial={{ strokeDashoffset: c }}
                          whileInView={{ strokeDashoffset: c * (1 - s.percentage / 100) }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2, delay: 0.3 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-600">
                        {s.percentage}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-slate-800 leading-tight">{s.name}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.6, delay:0.3 }}
          className="space-y-6">
          {/* Profile Photo */}
          <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl overflow-hidden relative border border-gray-200 flex items-center justify-center">
            {intro.profileImage ? (
              <img
                src={intro.profileImage}
                alt={intro.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center">
                <div className="w-20 h-20 bg-slate-300 rounded-full mx-auto mb-3 flex items-center justify-center text-slate-500 text-3xl font-bold">
                  {intro.name.charAt(intro.name.length - 1)}
                </div>
                <p className="text-slate-500 text-sm font-medium">{intro.name}</p>
                <p className="text-slate-400 text-xs">{intro.role}</p>
              </div>
            )}
          </div>

          {/* Core Principles */}
          <div className="bg-slate-50 p-8 rounded-3xl border border-gray-100">
            <h3 className="text-lg font-bold mb-5">核心思維準則</h3>
            <ul className="space-y-4">
              {principles.items.map((p: any, i: number) => (
                <li key={i} className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{p.title}</div>
                    <div className="text-xs text-gray-500 leading-relaxed mt-0.5">{p.description}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </section>

      {/* ── Timeline ──────────────────────────────────────────────────────────── */}
      <motion.section aria-labelledby="timeline-title" initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.55 }}
        className="mb-24">
        <p className="text-xs font-bold tracking-widest text-blue-600 uppercase mb-3">My Journey</p>
        <h2 id="timeline-title" className="text-3xl font-bold tracking-tight mb-12">從零售巨頭到 AI 創業者</h2>

        <div className="relative pl-8 border-l-2 border-gray-100 space-y-10">
          {timeline.items.map((item: any, i: number) => (
            <motion.div key={i}
              initial={{ opacity:0, x:-16 }}
              whileInView={{ opacity:1, x:0 }}
              viewport={{ once:true, margin:'-40px' }}
              transition={{ duration:0.45, delay: i * 0.08 }}
              className="relative"
            >
              <div className="absolute -left-[2.85rem] w-10 h-10 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center text-slate-700 hover:border-[#1E3A8A] hover:text-[#1E3A8A] transition-colors">
                {TIMELINE_ICONS[i] || <Briefcase className="w-5 h-5" />}
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-gray-200 hover:shadow-sm transition-all ml-4">
                <div className="text-xs font-bold text-gray-400 tracking-widest mb-1">{item.year}</div>
                <div className="font-bold text-slate-900 mb-2">{item.title}</div>
                <div className="text-sm text-gray-500 leading-relaxed">{item.description}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── CTA ───────────────────────────────────────────────────────────────── */}
      <motion.section aria-label="行動呼籲" initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
        className="text-center bg-slate-50 rounded-3xl border border-gray-100 p-12">
        <h3 className="text-2xl font-bold mb-4">準備好一起實戰了嗎？</h3>
        <p className="text-gray-500 mb-8 max-w-md mx-auto text-sm">探索老 J 親自開發並驗證的 AI 工具，立即開始你的自動化變現之旅。</p>
        <Link to="/tools"
          className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full font-medium hover:bg-[#1E3A8A] hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
          瀏覽所有 AI 工具 <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.section>
    </article>
  );
}
