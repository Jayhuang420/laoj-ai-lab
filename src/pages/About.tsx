import React, { useEffect, useState } from 'react';
import { CheckCircle2, Briefcase, Rocket, Bot, Users, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

/* ── Defaults (fallback when API has no data) ─────────────────────────────── */
const DEFAULTS = {
  intro: {
    name: '老 J',
    role: 'AI 音樂頻道變現實戰家',
    headline: '從操盤百億的零售高管\n到靠 AI 音樂頻道領被動收入',
    bio: [
      '我做了 12 年零售，管過上百間門市、扛過上億營收。但真正讓我做出「睡覺也在累積收入」的，不是管理經驗——而是一個我不露臉、不唱歌、連樂理都不懂也能經營的 YouTube 音樂頻道。',
      '因為 AI 把遊戲規則改寫了。現在一個人就能用 Suno 量產原創音樂、用 AI 生成封面與 MV，養出一個會自動累積收益的頻道。我把零售練出的「選品」與「看數據」直覺套進去，結果比我想的還快——虛擬歌手「唯夏 VXYA」30 天就開通營利。',
      '而且這不是只有我做得到。「ChillNight」每月穩定領被動分潤，我 4 月開課的學員也陸續開通營利。我經營老 J AI 實驗室，就是想把這套可複製的 SOP，交到更多想靠內容翻身的普通人手上。',
    ],
  },
  skills: {
    items: [
      { name: '選題對標・找賺錢利基', percentage: 94 },
      { name: 'Suno AI 原創音樂製作', percentage: 96 },
      { name: 'AI 封面 / MV 視覺', percentage: 88 },
      { name: 'YouTube 演算法 / SEO', percentage: 90 },
      { name: '開通營利・多元變現', percentage: 92 },
    ],
  },
  principles: {
    items: [
      { title: '只教能變現的', description: '每個方法都對準一件事：怎麼讓頻道真的賺到錢。不教華而不實、做了也不會有收益的技巧。' },
      { title: '具體可複製', description: '所有教學都附具體步驟、可直接套用的提示詞與工作流，零基礎照著做就會，不用自己摸索半年。' },
      { title: '先營利、再放大', description: '優先最快看到第一筆收益的路徑，先開通 YouTube 營利，再疊加聯盟行銷與多頻道複製放大收入。' },
    ],
  },
  timeline: {
    items: [
      { year: '2011–2018', title: '零售業高階管理', description: '加入連鎖零售集團，從門市主管一路晉升至區域總監，操盤 150+ 門市、帶領 500+ 人團隊，年營收逾百億。' },
      { year: '2018–2022', title: '電商暨品牌數位轉型', description: '主導集團電商業務從零打造，整合 O2O 策略，打通線下數據鏈路，帶動整體業績年成長 40%+。' },
      { year: '2022–2024', title: '白天上班，晚上做 AI 副業', description: '下班後鑽研 AI 變現，部落格、短影音都試過卻沒起色；直到把「AI 音樂 + 不露臉頻道」組合起來，才跑出第一個真正會賺錢的模型。' },
      { year: '2024–Now', title: '音樂頻道教學 & 老 J AI 實驗室', description: '養出唯夏 VXYA、ChillNight 等多個營利頻道，並開課教學。第一批 4 月學員零基礎起步，最快一個多月就開通 YouTube 營利。' },
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

  /* JSON-LD: ProfilePage + Person + BreadcrumbList */
  const aboutJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      mainEntity: {
        '@type': 'Person',
        name: '老J',
        alternateName: 'Old J',
        jobTitle: 'AI 音樂頻道變現教學者 / AI 實驗室創辦人',
        description: '12 年零售業高階管理經驗，轉型專注用 AI 打造不露臉 YouTube 音樂頻道變現。親手養出唯夏 VXYA、ChillNight 等營利頻道，並開課教學。',
        url: 'https://www.oldjailab.com/about',
        worksFor: {
          '@type': 'Organization',
          name: '老J AI 實驗室',
          url: 'https://www.oldjailab.com',
        },
        knowsAbout: ['AI 音樂製作', 'Suno', '不露臉 YouTube 頻道', 'YouTube 變現', 'AI 內容創作', '聯盟行銷'],
        sameAs: ['https://www.youtube.com/@chillnightAImusic', 'https://www.youtube.com/@VXYA_officialmusic', 'https://www.threads.com/@jay770420'],
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '首頁', item: 'https://www.oldjailab.com/' },
        { '@type': 'ListItem', position: 2, name: '關於老J', item: 'https://www.oldjailab.com/about' },
      ],
    },
  ];

  return (
    <article className="py-20 px-6 max-w-6xl mx-auto">
      <SEO
        title="關於老J — 從零售高管到 AI 音樂頻道教學者"
        description="老J：12 年零售業高階管理經驗，轉型用 AI 打造不露臉 YouTube 音樂頻道變現。親手養出唯夏 VXYA、ChillNight 等營利頻道，並開課教學，學員陸續開通營利。"
        path="/about"
        jsonLd={aboutJsonLd}
      />

      {/* ── Intro ─────────────────────────────────────────────────────────────── */}
      <section aria-label="個人簡介" className="grid md:grid-cols-2 gap-16 items-start mb-24">
        <motion.div initial="initial" animate="animate"
          variants={{ initial:{opacity:0}, animate:{opacity:1,transition:{staggerChildren:0.1,delayChildren:0.1}} }}>
          <motion.p variants={fadeInUp} className="text-xs font-bold tracking-widest text-violet-600 uppercase mb-4">About Old J</motion.p>
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
          <motion.div variants={fadeInUp} className="mt-8 relative">
            <p className="text-sm font-bold text-slate-900 mb-4">這也是我會手把手教你的 5 件事：</p>
            <svg className="absolute w-0 h-0" aria-hidden="true">
              <defs>
                <linearGradient id="skill-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#d946ef" />
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
                    className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-violet-200 transition-all cursor-default"
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
                  <CheckCircle2 className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
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
        <p className="text-xs font-bold tracking-widest text-fuchsia-600 uppercase mb-3">My Journey</p>
        <h2 id="timeline-title" className="text-3xl font-bold tracking-tight mb-12">從零售巨頭到 AI 音樂頻道實戰家</h2>

        <div className="relative pl-8 border-l-2 border-gray-100 space-y-10">
          {timeline.items.map((item: any, i: number) => (
            <motion.div key={i}
              initial={{ opacity:0, x:-16 }}
              whileInView={{ opacity:1, x:0 }}
              viewport={{ once:true, margin:'-40px' }}
              transition={{ duration:0.45, delay: i * 0.08 }}
              className="relative"
            >
              <div className="absolute -left-[2.85rem] w-10 h-10 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center text-slate-700 hover:border-[#6D28D9] hover:text-[#6D28D9] transition-colors">
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
        <h3 className="text-2xl font-bold mb-4">準備好打造你的音樂頻道了嗎？</h3>
        <p className="text-gray-500 mb-8 max-w-md mx-auto text-sm">看我怎麼做、跟著學，從 0 衝刺你的第一個開通營利的 AI 音樂頻道。</p>
        <a href="https://ebook.oldjailab.com/" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full font-medium hover:bg-[#6D28D9] hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
          了解線上課程 <ArrowRight className="w-4 h-4" />
        </a>
      </motion.section>
    </article>
  );
}
