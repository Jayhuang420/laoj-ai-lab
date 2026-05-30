import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

/* ── Defaults (fallback when API has no data) ─────────────────────────────── */
const DEFAULTS = {
  intro: {
    name: '老 J',
    role: 'AI 音樂頻道變現實戰家',
    headline: '從操盤百億的零售高管\n到靠 AI 音樂頻道領被動收入',
    bio: [
      '我做了 12 年零售，管過上百間門市、扛過上億營收。但真正讓我做出「睡覺也在累積收入」的，不是管理經驗——而是一個我不露臉、不唱歌、連樂理都不懂也能經營的 YouTube 音樂頻道。',
      '因為 AI 把遊戲規則改寫了。現在一個人就能用 Suno 量產原創音樂、用 AI 生成封面與 MV，養出一個會自動累積收益的頻道。我把零售練出的「選品」與「看數據」直覺套進去，結果比我想的還快——我打造的 AI 音樂廠牌「唯夏 VXYA Music」30 天就開通營利。',
      '而且這不是只有我做得到。「ChillNight」每月穩定領被動分潤，我 4 月開課的學員也陸續開通營利。我經營老 J AI 實驗室，就是想把這套可複製的 SOP，交到更多想靠內容翻身的普通人手上。',
    ],
  },
  stats: {
    items: [
      { value: '2', label: '親手養出的營利頻道' },
      { value: '1 個多月', label: '學員最快開通營利' },
      { value: '12 年', label: '零售管理實戰' },
    ],
  },
  timeline: {
    items: [
      { year: '2011–2018', title: '零售業高階管理', description: '從門市主管一路晉升至區域總監，操盤 150+ 門市、帶領 500+ 人團隊，年營收逾百億。' },
      { year: '2018–2022', title: '電商暨品牌數位轉型', description: '主導集團電商業務從零打造，整合 O2O 策略，帶動整體業績年成長 40%+。' },
      { year: '2022–2024', title: '白天上班，晚上做 AI 副業', description: '部落格、短影音都試過卻沒起色；直到把「AI 音樂 + 不露臉頻道」組合起來，才跑出第一個真正會賺錢的模型。' },
      { year: '2024–Now', title: '音樂頻道教學 & 老 J AI 實驗室', description: '養出唯夏 VXYA、ChillNight 等營利頻道並開課教學，第一批 4 月學員最快一個多月就開通 YouTube 營利。' },
    ],
  },
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.55, ease: EASE },
};

export default function About() {
  const [content, setContent] = useState<Record<string, any>>({});

  useEffect(() => {
    fetch('/api/content/about').then(r => r.ok ? r.json() : {}).then(setContent).catch(() => {});
  }, []);

  const intro = { ...DEFAULTS.intro, ...content.intro };
  const stats = content.stats?.items ? content.stats : DEFAULTS.stats;
  const timeline = content.timeline?.items ? content.timeline : DEFAULTS.timeline;
  const headlineLines = (intro.headline || '').split('\n');
  const profileImage = intro.profileImage || '/images/hero-profile.jpg';

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
    <article className="px-6">
      <SEO
        title="關於老J — 從零售高管到 AI 音樂頻道教學者"
        description="老J：12 年零售業高階管理經驗，轉型用 AI 打造不露臉 YouTube 音樂頻道變現。親手養出唯夏 VXYA、ChillNight 等營利頻道，並開課教學，學員陸續開通營利。"
        path="/about"
        jsonLd={aboutJsonLd}
      />

      {/* ── Intro ─ photo-forward, minimal ─────────────────────────────────────── */}
      <section aria-label="個人簡介" className="max-w-3xl mx-auto text-center pt-12 pb-14">
        <motion.img {...fadeInUp}
          src={profileImage}
          alt={intro.name}
          loading="eager"
          className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover object-top mx-auto mb-8 ring-4 ring-violet-100 shadow-xl shadow-violet-500/10"
        />
        <motion.p {...fadeInUp} className="text-xs font-bold tracking-widest text-violet-600 uppercase mb-5">關於老 J</motion.p>
        <motion.h1 {...fadeInUp} className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.2] mb-6">
          {headlineLines.map((line: string, i: number) => (
            <React.Fragment key={i}>
              {line}
              {i < headlineLines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </motion.h1>
        <motion.p {...fadeInUp} className="text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto mb-9">
          {intro.bio[0]}
        </motion.p>
        <motion.div {...fadeInUp} className="flex flex-wrap justify-center gap-3">
          <a href="https://ebook.oldjailab.com/" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-7 py-3.5 rounded-full font-medium hover:bg-[#6D28D9] hover:-translate-y-0.5 transition-all duration-300">
            了解線上課程 <ArrowRight className="w-4 h-4" />
          </a>
          <Link to="/"
            className="inline-flex items-center gap-2 border border-slate-200 text-slate-900 px-7 py-3.5 rounded-full font-medium hover:bg-slate-50 hover:-translate-y-0.5 transition-all duration-300">
            看我的作品與頻道
          </Link>
        </motion.div>
      </section>

      {/* ── Stats ─ replaces skill rings ───────────────────────────────────────── */}
      <motion.section {...fadeInUp} aria-label="關鍵數字"
        className="max-w-3xl mx-auto grid grid-cols-3 gap-4 border-y border-gray-100 py-8 mb-16">
        {stats.items.map((s: any, i: number) => (
          <div key={i} className="text-center">
            <div className="text-2xl md:text-4xl font-extrabold tracking-tight text-slate-900">{s.value}</div>
            <div className="text-xs md:text-sm text-gray-500 mt-1.5">{s.label}</div>
          </div>
        ))}
      </motion.section>

      {/* ── Story ──────────────────────────────────────────────────────────────── */}
      <section aria-label="我的故事" className="max-w-2xl mx-auto pb-16">
        {intro.bio.slice(1).map((p: string, i: number) => (
          <motion.p key={i} {...fadeInUp} className="text-base md:text-lg text-gray-600 leading-[1.9] mb-6">
            {p}
          </motion.p>
        ))}
      </section>

      {/* ── Timeline ─ minimal ─────────────────────────────────────────────────── */}
      <section aria-labelledby="timeline-title" className="max-w-2xl mx-auto pb-16">
        <motion.h2 {...fadeInUp} id="timeline-title" className="text-2xl md:text-3xl font-bold tracking-tight mb-10">
          我走過的路
        </motion.h2>
        <div className="relative border-l border-gray-200 pl-7 space-y-9">
          {timeline.items.map((item: any, i: number) => (
            <motion.div key={i} {...fadeInUp} transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }} className="relative">
              <span className="absolute -left-[2.1rem] top-1.5 w-3 h-3 rounded-full bg-violet-500 ring-4 ring-violet-100" />
              <div className="text-xs font-bold text-gray-400 tracking-widest mb-1">{item.year}</div>
              <div className="font-bold text-slate-900 mb-1.5">{item.title}</div>
              <div className="text-sm text-gray-500 leading-relaxed">{item.description}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────────── */}
      <motion.section {...fadeInUp} aria-label="行動呼籲" className="max-w-2xl mx-auto text-center pb-24">
        <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">準備好打造你的音樂頻道了嗎？</h3>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">看我怎麼做、跟著學，從 0 衝刺你的第一個開通營利的 AI 音樂頻道。</p>
        <a href="https://ebook.oldjailab.com/" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-8 py-4 rounded-full font-semibold shadow-lg shadow-fuchsia-500/25 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300">
          了解線上課程 <ArrowRight className="w-4 h-4" />
        </a>
      </motion.section>
    </article>
  );
}
