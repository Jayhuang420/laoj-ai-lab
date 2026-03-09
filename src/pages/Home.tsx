import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Youtube, ShoppingBag, Mail, CheckCircle2, Play,
         Zap, Target, TrendingUp, Users, MousePointer, Cpu, Rocket,
         Music, Dices, Hash, Sparkles, Utensils, BookOpen, Lightbulb, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useInView, animate } from 'motion/react';
import { useToast } from '../context/ToastContext';
import SEO from '../components/SEO';

const TOOL_ICON_MAP: Record<string, React.ReactNode> = {
  Music: <Music className="w-6 h-6" />,
  Youtube: <Youtube className="w-6 h-6" />,
  Dices: <Dices className="w-6 h-6" />,
  Hash: <Hash className="w-6 h-6" />,
  Sparkles: <Sparkles className="w-6 h-6" />,
  Utensils: <Utensils className="w-6 h-6" />,
  BookOpen: <BookOpen className="w-6 h-6" />,
  Lightbulb: <Lightbulb className="w-6 h-6" />,
  Wrench: <Wrench className="w-6 h-6" />,
  ShoppingBag: <ShoppingBag className="w-6 h-6" />,
};

/* ── Defaults (fallback when API has no data) ─────────────────────────────── */
const DEFAULTS = {
  hero: {
    badgeText: '12年+ 零售業高階經理人 帶你如何使用AI 落地變現',
    title: '不談空泛理論\n只教你打造',
    titleHighlight: '高獲利 AI 事業',
    subtitle: '專為「一人公司」設計的實戰指南。結合精實創業與 PLG 思維，將 AI 從生產力工具轉化為具備 PMF 的可規模化業務。',
    ctaText: '探索 AI 實戰工具',
    ctaSecondary: '領取變現全景地圖',
    photoBadge: 'AI 變現實戰家',
    trustBadges: '✓ 親身實戰驗證,✓ 一人公司適用,✓ 零廢話教學,✓ 每月持續更新',
  },
  howItWorks: {
    label: '運作方式',
    sectionTitle: '三步驟打造 AI 變現引擎',
    sectionSubtitle: '從驗證到規模化，一套可複製的系統性方法論。',
    steps: [
      { icon: 'Target', title: '找到你的剛需痛點', description: '用精實創業思維，在開始前先驗證市場需求，避免打造沒人要的產品。' },
      { icon: 'Cpu', title: '搭建 AI 自動化工作流', description: '從內容產出、客服到數據分析，讓 AI 擔任你的「虛擬團隊」，大幅降低人力成本。' },
      { icon: 'TrendingUp', title: '快速迭代、放大獲利', description: '以 PLG 思維為核心，透過數據反饋持續優化，將成功的工作流複製並規模化。' },
    ],
  },
  leadMagnet: {
    label: '限時免費領取',
    title: '《2026 AI 變現全景地圖》',
    subtitle: '拆解從 0 到 1 的 AI 變現路徑，涵蓋必備工具清單、3 個立即可執行的自動化工作流，以及老 J 親測有效的選品策略。',
    buttonText: '立即發送給我',
    boxTitle: 'AI 變現全景地圖',
    boxSubtitle: 'PDF 實戰指南',
    privacyText: '承諾不發送垃圾郵件，隨時可取消訂閱。',
  },
  featuredTools: {
    sectionTitle: '熱門 AI 變現工具',
    sectionSubtitle: '針對不同技能與目標，提供具體可執行的 AI 賦能策略。',
    linkText: '查看所有 AI 工具',
  },
  stats: {
    sectionTitle: '一人公司的實戰驗證',
    sectionSubtitle: '在極簡的架構下，我們用數據說話。',
    items: [
      { number: 300, suffix: '%', label: '內容產出效率提升', sub: '透過 AI 腳本與自動化剪輯' },
      { number: 450, suffix: '%', label: '分潤收益成長', sub: '導入精準選品與自動推廣後' },
      { number: 12, suffix: '+', label: '年零售業高階管理', sub: '涵蓋百億級連鎖品牌操盤' },
    ],
  },
  ctaBanner: {
    title: '準備好開始你的 AI 變現之旅了嗎？',
    subtitle: '加入數百位正在用 AI 打造一人公司的創業者，立即領取你的第一份實戰地圖。',
    buttonText: '立即加入',
  },
};

const ICON_MAP: Record<string, React.ReactNode> = {
  Target: <Target className="w-7 h-7" />,
  Cpu: <Cpu className="w-7 h-7" />,
  TrendingUp: <TrendingUp className="w-7 h-7" />,
};

/* ── Animated Counter ───────────────────────────────────────────────────────── */
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  useEffect(() => {
    if (!inView || !ref.current) return;
    const controls = animate(0, to, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: v => { if (ref.current) ref.current.textContent = Math.round(v).toString(); },
    });
    return controls.stop;
  }, [inView, to]);
  return <><span ref={ref}>0</span>{suffix}</>;
}

/* ── Main ───────────────────────────────────────────────────────────────────── */
export default function Home() {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);
  const [content, setContent] = useState<Record<string, any>>({});
  const [apiTools, setApiTools] = useState<any[]>([]);

  /* Fetch dynamic content + tools */
  useEffect(() => {
    fetch('/api/content/home').then(r => r.ok ? r.json() : {}).then(setContent).catch(() => {});
    fetch('/api/tools').then(r => r.ok ? r.json() : []).then((data: any[]) => { if (data.length) setApiTools(data); }).catch(() => {});
  }, []);

  const hero = { ...DEFAULTS.hero, ...content.hero };
  const howItWorks = { ...DEFAULTS.howItWorks, ...content.howItWorks, steps: content.howItWorks?.steps || DEFAULTS.howItWorks.steps };
  const leadMagnet = { ...DEFAULTS.leadMagnet, ...content.leadMagnet };
  const featuredTools = { ...DEFAULTS.featuredTools, ...content.featuredTools };
  const statsData = { ...DEFAULTS.stats, ...content.stats, items: content.stats?.items || DEFAULTS.stats.items };
  const ctaBanner = { ...DEFAULTS.ctaBanner, ...content.ctaBanner };

  /* Mouse tracking for hero gradient */
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const onMove = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    };
    hero.addEventListener('mousemove', onMove);
    return () => hero.removeEventListener('mousemove', onMove);
  }, []);

  /* Email subscribe */
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) { showToast(data.message, 'success'); setEmail(''); }
      else showToast(data.error, 'error');
    } catch { showToast('網路錯誤，請稍後再試。', 'error'); }
    finally { setSubmitting(false); }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-50px' },
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  };

  /* Parse hero title into lines + highlight */
  const titleLines = (hero.title || '').split('\n');
  const highlightText = hero.titleHighlight || '高獲利 AI 事業';

  /* Trust badges */
  const trustBadges = (hero.trustBadges || '').split(',').map((s: string) => s.trim()).filter(Boolean);

  /* JSON-LD: HomePage + Lead Magnet Offer */
  const homeJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: '老J AI 實驗室 — AI 變現教學與自動化工具',
      description: '專為一人公司設計的 AI 變現實戰指南。結合精實創業與 PLG 思維，將 AI 從生產力工具轉化為可規模化業務。',
      url: 'https://laojailab.com/',
      inLanguage: 'zh-TW',
      isPartOf: { '@type': 'WebSite', name: '老J AI 實驗室', url: 'https://laojailab.com' },
      about: {
        '@type': 'Thing',
        name: 'AI 變現',
        description: '利用人工智慧技術為一人公司和創業者創造收益的方法論',
      },
      mainEntity: {
        '@type': 'ItemList',
        name: howItWorks.sectionTitle,
        itemListElement: howItWorks.steps.map((s: any, i: number) => ({
          '@type': 'ListItem', position: i + 1, name: s.title, description: s.description,
        })),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Offer',
      name: '2026 AI 變現全景地圖',
      description: leadMagnet.subtitle,
      price: '0',
      priceCurrency: 'TWD',
      availability: 'https://schema.org/InStock',
      url: 'https://laojailab.com/#lead-magnet',
      offeredBy: { '@type': 'Organization', name: '老J AI 實驗室' },
    },
  ];

  return (
    <>
      <SEO
        path="/"
        description="不談空泛理論，只教你打造高獲利 AI 事業。老J AI 實驗室提供一人公司 AI 變現實戰指南、自動化工作流教學，結合 12 年零售管理與精實創業思維。"
        jsonLd={homeJsonLd}
      />

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        aria-label="品牌主視覺"
        className="relative pt-28 pb-16 lg:pt-36 lg:pb-20 px-6 overflow-hidden bg-slate-50"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:32px_32px] opacity-40 [mask-image:linear-gradient(to_bottom,white,transparent)]" />

        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(600px circle at ${mousePos.x}% ${mousePos.y}%, rgba(52,211,153,0.12) 0%, rgba(96,165,250,0.08) 40%, transparent 70%)`,
          }}
        />

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[600px] pointer-events-none -z-10">
          <motion.div animate={{ scale: [1,1.1,1], opacity:[0.4,0.6,0.4], x:[-50,50,-50] }} transition={{ duration: 10, repeat: Infinity, ease:'easeInOut' }}
            className="absolute top-0 left-0 w-96 h-96 bg-emerald-200/60 rounded-full blur-3xl mix-blend-multiply" />
          <motion.div animate={{ scale: [1,1.2,1], opacity:[0.3,0.5,0.3], x:[50,-50,50] }} transition={{ duration: 12, repeat: Infinity, ease:'easeInOut', delay:1 }}
            className="absolute top-20 right-0 w-[30rem] h-[30rem] bg-blue-200/60 rounded-full blur-3xl mix-blend-multiply" />
        </div>

        <style>{`
          @keyframes heroFadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes heroScaleIn { from { opacity: 0; transform: scale(0.85) translateX(40px); } to { opacity: 1; transform: scale(1) translateX(0); } }
          @keyframes heroUnderline { from { transform: scaleX(0) rotate(-1deg); } to { transform: scaleX(1) rotate(-1deg); } }
          @keyframes heroBadgeBounce { 0%,100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(-5px); } }
          .hero-fade { animation: heroFadeIn 0.6s ease-out both; }
          .hero-scale { animation: heroScaleIn 0.8s cubic-bezier(0.16,1,0.3,1) both; }
        `}</style>

        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16 relative z-10">
          {/* Left: Text Content */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="hero-fade inline-flex items-center gap-2 border border-slate-200/60 bg-white/80 backdrop-blur-md rounded-full px-5 py-2 text-xs font-bold tracking-wider text-slate-700 mb-8 shadow-sm hover:shadow-md transition-shadow"
              style={{ animationDelay: '0.1s' }}>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              {hero.badgeText}
            </div>

            <h1 className="hero-fade text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight leading-[1.15] mb-8 text-slate-900"
              style={{ animationDelay: '0.25s' }}>
              {titleLines.map((line: string, i: number) => (
                <React.Fragment key={i}>
                  {line}
                  {i < titleLines.length - 1 && <br />}
                </React.Fragment>
              ))}
              <span className="relative whitespace-nowrap inline-block mt-2 md:mt-0 ml-2">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600">{highlightText}</span>
                <span className="absolute bottom-2 left-0 w-full h-3 md:h-4 bg-emerald-100/80 -z-10 origin-left"
                  style={{ animation: 'heroUnderline 0.8s ease-out 0.8s both' }} />
              </span>
            </h1>

            <p className="hero-fade text-lg md:text-xl text-slate-600 mb-10 max-w-2xl leading-relaxed font-medium"
              style={{ animationDelay: '0.4s' }}>
              {hero.subtitle}
            </p>

            <div className="hero-fade flex flex-wrap justify-center lg:justify-start gap-4 items-center"
              style={{ animationDelay: '0.55s' }}>
              <Link to="/tools" className="relative overflow-hidden group bg-slate-900 text-white px-8 py-4 rounded-full font-medium flex items-center gap-2 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-emerald-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center gap-2">{hero.ctaText} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
              </Link>
              <a href="#lead-magnet" className="bg-white/80 backdrop-blur-md border border-slate-200 text-slate-900 px-8 py-4 rounded-full font-medium flex items-center gap-2 hover:bg-slate-50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <Play className="w-4 h-4 text-emerald-600" /> {hero.ctaSecondary}
              </a>
            </div>
          </div>

          {/* Right: Profile Photo */}
          <div className="hero-scale relative shrink-0 order-first lg:order-last" style={{ animationDelay: '0.3s' }}>
            <div className="relative w-64 h-64 md:w-72 md:h-72 lg:w-80 lg:h-80">
              {/* Decorative glow */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400/20 to-blue-400/20 blur-2xl scale-125" />
              {/* Gradient ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 p-[3px] shadow-xl shadow-emerald-500/20">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-100">
                  <img
                    src="/images/hero-profile.jpg"
                    alt="老J — AI 實驗室創辦人"
                    className="w-full h-full object-cover object-top scale-110"
                    loading="eager"
                  />
                </div>
              </div>
              {/* Floating accent badge */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-2xl px-4 py-2 border border-slate-100 whitespace-nowrap"
                style={{ animation: 'heroBadgeBounce 3s ease-in-out infinite' }}>
                <span className="text-sm font-bold text-slate-800">{hero.photoBadge}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-fade relative z-10 mt-10 lg:mt-12 flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs text-slate-500 font-medium"
          style={{ animationDelay: '1s' }}>
          {trustBadges.map((t: string) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────────── */}
      <section aria-labelledby="how-it-works-title" className="py-14 px-6 max-w-6xl mx-auto border-t border-gray-100">
        <motion.div {...fadeInUp} className="mb-10 text-center">
          <p className="text-xs font-bold tracking-widest text-emerald-600 uppercase mb-3">{howItWorks.label}</p>
          <h2 id="how-it-works-title" className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{howItWorks.sectionTitle}</h2>
          <p className="text-gray-500 max-w-xl mx-auto">{howItWorks.sectionSubtitle}</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-10 left-[calc(16.6%+2rem)] right-[calc(16.6%+2rem)] h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
          {howItWorks.steps.map((s: any, i: number) => (
            <motion.div key={i} {...fadeInUp} transition={{ duration: 0.55, delay: i * 0.12, ease:[0.16,1,0.3,1] }}
              className="relative flex flex-col items-center text-center p-8 rounded-3xl bg-white border border-gray-100 hover:border-slate-300 hover:shadow-md transition-all group">
              <div className="absolute -top-4 left-8 text-[10px] font-black tracking-widest text-gray-300 group-hover:text-emerald-500 transition-colors">{String(i + 1).padStart(2, '0')}</div>
              <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-5 group-hover:bg-gradient-to-br group-hover:from-emerald-500 group-hover:to-blue-500 transition-all duration-300 shadow-sm">
                {ICON_MAP[s.icon] || <Target className="w-7 h-7" />}
              </div>
              <h3 className="text-lg font-bold mb-3">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Lead Magnet ───────────────────────────────────────────────────────── */}
      <section id="lead-magnet" aria-label="免費下載 AI 變現全景地圖" className="py-6 px-6 max-w-6xl mx-auto">
        <motion.div {...fadeInUp}
          className="bg-gradient-to-br from-slate-900 to-[#1E3A8A] rounded-[2rem] p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px]" />
          <div className="max-w-xl relative z-10">
            <p className="text-emerald-400 text-xs font-bold tracking-widest uppercase mb-3">{leadMagnet.label}</p>
            <h2 className="text-3xl font-bold mb-4 tracking-tight text-white">{leadMagnet.title}</h2>
            <p className="text-slate-300 mb-8 leading-relaxed text-sm">{leadMagnet.subtitle}</p>
            <form onSubmit={handleSubscribe} aria-label="訂閱電子報" className="flex flex-col sm:flex-row gap-3">
              <label htmlFor="subscribe-email" className="sr-only">Email 地址</label>
              <input
                id="subscribe-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="輸入你的 Email"
                required
                autoComplete="email"
                className="flex-1 bg-white/10 border border-white/20 text-white placeholder-slate-400 rounded-full px-6 py-4 focus:outline-none focus:border-white/60 focus:bg-white/15 transition-all text-sm"
              />
              <button
                type="submit"
                disabled={submitting}
                className="bg-white text-slate-900 px-8 py-4 rounded-full font-bold hover:bg-emerald-400 hover:text-white transition-all whitespace-nowrap text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? '發送中…' : leadMagnet.buttonText}
              </button>
            </form>
            <p className="text-xs text-slate-500 mt-4 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> {leadMagnet.privacyText}
            </p>
            <a
              href="https://line.me/ti/g2/WBNqN2jcZTzcmIPz1J5LyhEsrjn7mVrosUJHHg?utm_source=invitation&utm_medium=link_copy&utm_campaign=default"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 bg-white/10 border border-white/20 text-white px-6 py-3 rounded-full font-medium hover:bg-emerald-500 hover:border-emerald-500 transition-all text-sm"
            >
              <Users className="w-4 h-4" /> 加入社群
            </a>
          </div>
          <div className="w-full md:w-52 aspect-square bg-white/10 border border-white/20 rounded-3xl flex items-center justify-center p-8 relative z-10 shrink-0">
            <div className="text-center">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-white" />
              </div>
              <div className="font-bold text-white text-sm">{leadMagnet.boxTitle}</div>
              <div className="text-xs text-slate-400 mt-1">{leadMagnet.boxSubtitle}</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Featured Tools ────────────────────────────────────────────────────── */}
      <section id="solutions" aria-labelledby="featured-tools-title" className="py-14 px-6 max-w-6xl mx-auto border-t border-gray-100">
        <motion.div {...fadeInUp} className="mb-10">
          <h2 id="featured-tools-title" className="text-3xl font-bold tracking-tight mb-4">{featuredTools.sectionTitle}</h2>
          <p className="text-gray-500 max-w-2xl">{featuredTools.sectionSubtitle}</p>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-6">
          {apiTools.slice(0, 4).map((tool, i) => (
            <motion.div key={tool.id ?? i} {...fadeInUp} transition={{ duration: 0.5, delay: 0.1 * (i + 1), ease:[0.16,1,0.3,1] }}
              className="group p-8 rounded-3xl border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all bg-white hover:-translate-y-1">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 text-[#1A1A1A] group-hover:bg-[#1A1A1A] group-hover:text-white transition-all duration-300">
                {TOOL_ICON_MAP[tool.icon_name] || <Wrench className="w-6 h-6" />}
              </div>
              <h3 className="text-xl font-bold mb-3">{tool.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">{tool.description}</p>
              <a href={tool.url} target="_blank" rel="noopener noreferrer"
                className="text-sm font-medium flex items-center gap-1 text-[#1E3A8A] group-hover:gap-2 transition-all">
                立即使用工具 <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          ))}
        </div>
        <motion.div {...fadeInUp} className="mt-8 text-center">
          <Link to="/tools" className="inline-flex items-center gap-2 text-[#1A1A1A] font-medium border-b border-[#1A1A1A] pb-1 hover:text-[#1E3A8A] hover:border-[#1E3A8A] transition-colors">
            {featuredTools.linkText} <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────────── */}
      <section aria-labelledby="stats-title" className="py-14 px-6 max-w-6xl mx-auto border-t border-gray-100">
        <motion.div {...fadeInUp} className="mb-10 text-center max-w-2xl mx-auto">
          <h2 id="stats-title" className="text-3xl font-bold tracking-tight mb-4">{statsData.sectionTitle}</h2>
          <p className="text-gray-500">{statsData.sectionSubtitle}</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-8">
          {statsData.items.map((s: any, i: number) => (
            <motion.div key={i} {...fadeInUp} transition={{ delay: 0.1 * (i + 1) }}
              className="text-center p-8 rounded-3xl bg-white border border-gray-100 hover:border-slate-200 hover:shadow-sm transition-all group">
              <div className="text-5xl font-light tracking-tighter mb-2 text-[#1A1A1A] group-hover:text-[#1E3A8A] transition-colors">
                <Counter to={s.number} suffix={s.suffix} />
              </div>
              <div className="text-sm font-bold text-gray-900 mb-1">{s.label}</div>
              <div className="text-xs text-gray-500">{s.sub}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Collaboration CTA ─────────────────────────────────────────────────── */}
      <section aria-label="合作洽談" className="py-10 px-6 max-w-6xl mx-auto">
        <motion.div {...fadeInUp}
          className="rounded-3xl bg-slate-900 text-white p-10 md:p-14 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(52,211,153,0.08),rgba(96,165,250,0.08))]" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="flex-1 text-center md:text-left">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0">
                <Rocket className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                想讓 AI 幫你的事業加速？
              </h2>
              <p className="text-gray-300 leading-relaxed max-w-lg">
                不管是自動化工作流、品牌轉型還是商業模式設計，老 J 都能幫你找到最適合的 AI 解法。預約一次免費諮詢，讓我們聊聊你的需求。
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-white text-slate-900 px-10 py-4 rounded-full font-medium hover:bg-emerald-50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                立即預約免費諮詢 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────────────── */}
      <section aria-label="加入行動呼籲" className="py-10 px-6 max-w-6xl mx-auto mb-6">
        <motion.div {...fadeInUp}
          className="rounded-3xl border border-gray-100 bg-slate-50 p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(52,211,153,0.04),rgba(96,165,250,0.04))]" />
          <div className="relative z-10">
            <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Zap className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">{ctaBanner.title}</h2>
            <p className="text-gray-600 mb-8 max-w-xl mx-auto">{ctaBanner.subtitle}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#lead-magnet" className="inline-flex items-center gap-2 bg-slate-900 text-white px-10 py-4 rounded-full font-medium hover:bg-[#1E3A8A] hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <Users className="w-4 h-4" /> {ctaBanner.buttonText}
              </a>
              <a
                href="https://line.me/ti/g2/WBNqN2jcZTzcmIPz1J5LyhEsrjn7mVrosUJHHg?utm_source=invitation&utm_medium=link_copy&utm_campaign=default"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-slate-300 text-slate-900 px-10 py-4 rounded-full font-medium hover:bg-slate-900 hover:text-white hover:border-slate-900 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <Users className="w-4 h-4" /> 加入社群
              </a>
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
}
