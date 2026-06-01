import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Youtube, ShoppingBag, Mail, CheckCircle2, Play,
         Zap, Target, TrendingUp, Users, MousePointer, Cpu, Rocket,
         Music, Dices, Hash, Sparkles, Utensils, BookOpen, Lightbulb, Wrench,
         Clock, Folder, Eye, ChevronDown, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useInView, animate } from 'motion/react';
import { useToast } from '../context/ToastContext';
import SEO from '../components/SEO';
import EbookBanner from '../components/EbookBanner';

/* Shared cubic-bezier easing (typed as a tuple so motion's Easing type accepts it) */
const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

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
    badgeText: '12 年零售高管 · 親手養出 2 個營利中的 AI 音樂頻道',
    title: '不露臉、不唱歌、不懂樂理\n用 AI 打造會自動賺錢的',
    titleHighlight: '音樂頻道',
    subtitle: '我已經驗證 2 次：AI 音樂廠牌「唯夏 VXYA Music」30 天開通 YouTube 營利，「ChillNight」每月領被動分潤。現在，我把整套可複製的 SOP 教給你。',
    ctaText: '免費領取 AI 音樂變現指南',
    ctaSecondary: '試聽代表作品',
    photoBadge: 'AI 音樂變現實戰家',
    trustBadges: '✓ 30 天開通營利,✓ 不需露臉出鏡,✓ 零樂理基礎,✓ 完整 SOP 複製',
  },
  works: {
    label: '代表作品 · ORIGINAL WORKS',
    sectionTitle: '點開就懂——這些都是 AI 做的原創音樂',
    sectionSubtitle: '唯夏 VXYA Music × ChillNight 的原創 MV，每一首都是頻道實際在跑、實際在累積收益的內容。',
    featuredId: 'V2qLxxpaZxo',
    featuredTitle: '《辭雪樓》戲腔古典情歌 · 破 3 萬觀看',
    items: [
      { id: 'igtxFHoR-3k', title: '《夢蝶》', tag: '古典戲腔', cover: '/images/works/mengdie.jpg' },
      { id: 'lC1DMjpd5Bs', title: '《破雲槍》', tag: '古風熱血戰歌', cover: '/images/works/poyunqiang.jpg' },
      { id: '0GVhRwCAWi4', title: '《長風入喉》', tag: '古風熱血戰歌', cover: '/images/works/changfeng.jpg' },
      { id: 'dOYDE3Lr2ds', title: '《舊戲辭》', tag: '古典戲腔', cover: '/images/works/jiuxici.jpg' },
      { id: 'i_4_dEzL_vc', title: '《醉月仙》', tag: '仙俠浪漫情歌', cover: '/images/works/zuiyuexian.jpg' },
    ],
  },
  channels: {
    label: '真實戰績',
    sectionTitle: '我不只教學，我自己就在做',
    sectionSubtitle: '這兩個頻道都是我親手從 0 養起，現在仍在持續更新、持續產生收益。',
    items: [
      {
        name: '唯夏 VXYA Music',
        tag: 'AI 音樂廠牌・旗下多位虛擬歌手',
        desc: '我從 0 打造的 AI 音樂廠牌，頻道 30 天開通 YouTube 營利。旗艦歌手「唯夏」單曲《辭雪樓》破 3 萬觀看，旗下持續擴張更多虛擬歌手。',
        metric: '30 天',
        metricLabel: '開通營利',
        url: 'https://www.youtube.com/@VXYA_officialmusic',
        accent: 'violet',
        avatar: '/images/channels/vxya.jpg',
      },
      {
        name: 'ChillNight AI Music',
        tag: '不露臉純音樂頻道',
        desc: '主打深夜放鬆、Trap、國風說唱的不露臉音樂頻道，用 AI 量產長片合輯與 Shorts，穩定累積 YouTube 廣告分潤。',
        metric: 'NT$2萬+',
        metricLabel: '月被動分潤',
        url: 'https://www.youtube.com/@chillnightAImusic',
        accent: 'fuchsia',
        avatar: '/images/channels/chillnight.jpg',
      },
    ],
  },
  students: {
    label: '學員實證',
    sectionTitle: '不是只有我做得到，學員也跟著做出來了',
    sectionSubtitle: '4 月開課的學員，零基礎跟著 SOP 操作，一個多月就看到成果。',
    items: [
      {
        name: '流行引力 Pulse Gravity',
        handle: '@PulseGravity',
        avatar: '/images/channels/pulsegravity.jpg',
        niche: '國風史詩電音 · 布袋戲戰鼓',
        stat: '1,600+ 訂閱 · 129 部影片',
        result: '4 月零基礎加入，5 月中開通 YouTube 營利，並已開放頻道會員。',
        url: 'https://www.youtube.com/@PulseGravity',
        accent: 'violet',
      },
      {
        name: '光室謐靜',
        handle: '@lightzen108',
        avatar: '/images/channels/lightzen108.jpg',
        niche: '療癒頻率音樂 · 助眠冥想',
        stat: '450+ 訂閱 · 21 部影片',
        result: '4 月加入，從 0 起步穩定產出，即將達成 YouTube 營利門檻。',
        url: 'https://www.youtube.com/@lightzen108',
        accent: 'fuchsia',
      },
    ],
  },
  course: {
    label: '線上課程',
    sectionTitle: '用 YouTube 打造你的第一條被動收入',
    sectionSubtitle: '從 0 到開通營利的完整 SOP：選題對標 → Suno 生成音樂 → 影片製作 → 上架 YouTube → 台灣收款。每一步都有手把手教學，跟著做就能上手。',
    priceLabel: '搶先優惠價',
    price: 'NT$3,888',
    priceOriginal: '定價 NT$9,950',
    priceNote: '每兩個月階梯漲價，11/1 起恢復完整定價',
    ctaText: '查看課程完整內容',
    url: 'https://ebook.oldjailab.com/',
    features: [
      '從零到營利的完整 SOP 教學電子書（價值 $1,990）',
      'Suno 專用做歌詞小工具（價值 $990）',
      '專屬教學社群，操作有問題隨時問（價值 $1,990）',
      '手把手影片教學，邊看邊做（價值 $990）',
      '台灣收款完整教學 AdSense / PIN / 電匯（價值 $990）',
      '未來新被動收入教學，免費更新（價值 $2,990）',
    ],
  },
  revenueProof: {
    label: '真實收益實證',
    sectionTitle: '不是喊口號，是真的有進帳',
    sectionSubtitle: '以下皆為真實後台截圖，非模擬數據。多元收入管道持續累積中。',
    items: [
      { img: '/images/proof/revenue_yt.jpg', title: 'YouTube 廣告收益', amount: 'US$500–945 / 月', tag: 'YouTube AdSense' },
      { img: '/images/proof/revenue_shopee.jpg', title: '蝦皮分潤收益', amount: 'NT$1.7 萬+ / 月', tag: 'Shopee Affiliate' },
      { img: '/images/proof/revenue_portaly.jpg', title: '虛擬 IP 周邊販售', amount: 'NT$5,357', tag: 'Portaly 金流' },
    ],
    note: '※ 以上為老J 本人頻道與品牌的真實後台截圖；個人成果會因投入與執行而異，不代表保證收益。',
  },
  faq: {
    label: '常見問題 · FAQ',
    sectionTitle: '開始前，你可能會問的 4 件事',
    items: [
      { q: 'AI 音樂頻道現在做，會不會太晚、太飽和了？', a: '音樂是「聽不膩」的剛需內容，市場每天都在長。重點不是早晚，而是有沒有用對標＋數據選對還沒被吃下的利基——我 4 月開課的學員，一個多月就開通營利。' },
      { q: 'AI 生成的音樂能營利嗎？版權、被檢舉怎麼辦？', a: '只要用合規工具生成原創音樂、不挪用他人素材，就能正常開通 YouTube 營利。課程會完整教你版權合規、原創聲明與避免被誤判的做法。' },
      { q: '要花多少錢、多久才看到第一筆收益？', a: 'AI 工具月成本台幣幾百元（Suno 等）。時間因人而異，但跟著 SOP 走、頻道達到 YouTube 營利門檻後就會開始累積收益；我的學員最快一個多月開通。' },
      { q: '我有正職、零基礎、不懂音樂，每天要花多久？', a: '整套流程設計成「下班後 1–2 小時可操作」。不需露臉、不需唱歌、不需樂理——AI 負責生成音樂與視覺，你負責選題與上架。' },
    ],
  },
  howItWorks: {
    label: '可複製的系統',
    sectionTitle: '3 步驟打造你的 AI 音樂變現頻道',
    sectionSubtitle: '從選題到上架營利，一套我親自跑過兩次的標準流程。',
    steps: [
      { icon: 'Target', title: '選對賺錢的利基', description: '用數據判斷哪種音樂風格有流量、有廣告價值，先確認方向再動手，不做沒人聽的內容。' },
      { icon: 'Cpu', title: 'AI 量產音樂與視覺', description: '用 Suno 生成原創音樂、AI 生成封面與 MV，一個人就能維持每日更新的產能。' },
      { icon: 'TrendingUp', title: '上架營利、放大收益', description: '開通 YouTube 營利後，疊加聯盟行銷、音樂授權與品牌合作，把單一頻道變成多重收入。' },
    ],
  },
  leadMagnet: {
    label: '限時免費領取',
    title: '《2026 不露臉 AI 音樂頻道變現指南》',
    subtitle: '完整拆解我兩個頻道的選題、製作、上架、營利流程。輸入 Email，立即免費寄到你的信箱。',
    bullets: [
      'AI 音樂頻道選題：3 分鐘判斷利基有沒有錢途',
      'Suno 出歌提示詞模板，複製就能生成原創音樂',
      '頻道封面 / MV 視覺的 AI 製作 SOP',
      '90 天從 0 到開通 YouTube 營利的行動清單',
    ],
    buttonText: '免費寄給我',
    boxTitle: 'AI 音樂變現指南',
    boxSubtitle: 'PDF 實戰手冊',
    privacyText: '承諾不發送垃圾郵件，隨時可取消訂閱。',
  },
  featuredTools: {
    sectionTitle: '免費 AI 工具箱',
    sectionSubtitle: '我自己在用的小工具，順手做給大家免費用。',
    linkText: '查看所有 AI 工具',
  },
  stats: {
    sectionTitle: '一人公司的變現實證',
    sectionSubtitle: '不喊口號，用我自己的頻道數據說話。',
    items: [
      { number: 30, suffix: ' 天', label: '虛擬歌手開通營利', sub: '唯夏 VXYA・從 0 到 1' },
      { number: 2, suffix: ' 萬+', label: '頻道月被動分潤', sub: 'ChillNight・YouTube 廣告' },
      { number: 3, suffix: ' 萬+', label: '單曲最高觀看', sub: '《辭雪樓》戲腔情歌' },
    ],
  },
  ctaBanner: {
    title: '準備好打造你的第一個 AI 音樂頻道了嗎？',
    subtitle: '加入社群，跟著正在用 AI 做不露臉頻道變現的創業者，領取你的第一份實戰指南。',
    buttonText: '免費領取指南',
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
      ease: EASE,
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
  const [leadName, setLeadName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);
  const [content, setContent] = useState<Record<string, any>>({});
  const [apiTools, setApiTools] = useState<any[]>([]);
  const [latestPosts, setLatestPosts] = useState<any[]>([]);
  const [showBar, setShowBar] = useState(false);
  const [barDismissed, setBarDismissed] = useState(false);

  /* Fetch dynamic content + tools + blog posts */
  useEffect(() => {
    fetch('/api/content/home').then(r => r.ok ? r.json() : {}).then(setContent).catch(() => {});
    fetch('/api/tools').then(r => r.ok ? r.json() : []).then((data: any[]) => { if (data.length) setApiTools(data); }).catch(() => {});
    fetch('/api/blog').then(r => r.ok ? r.json() : []).then((data: any[]) => setLatestPosts(data.slice(0, 3))).catch(() => {});
  }, []);

  /* Sticky course CTA visibility */
  useEffect(() => {
    const onScroll = () => setShowBar(window.scrollY > 700);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const hero = { ...DEFAULTS.hero, ...content.hero };
  const channels = { ...DEFAULTS.channels, ...content.channels, items: content.channels?.items || DEFAULTS.channels.items };
  const works = { ...DEFAULTS.works, ...content.works, items: content.works?.items || DEFAULTS.works.items };
  const students = { ...DEFAULTS.students, ...content.students, items: content.students?.items || DEFAULTS.students.items };
  const course = { ...DEFAULTS.course, ...content.course, features: content.course?.features || DEFAULTS.course.features };
  const revenueProof = { ...DEFAULTS.revenueProof, ...content.revenueProof, items: content.revenueProof?.items || DEFAULTS.revenueProof.items };
  const faq = { ...DEFAULTS.faq, ...content.faq, items: content.faq?.items || DEFAULTS.faq.items };
  const howItWorks = { ...DEFAULTS.howItWorks, ...content.howItWorks, steps: content.howItWorks?.steps || DEFAULTS.howItWorks.steps };
  const leadMagnet = { ...DEFAULTS.leadMagnet, ...content.leadMagnet, bullets: content.leadMagnet?.bullets || DEFAULTS.leadMagnet.bullets };
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
    if (!leadName.trim()) { showToast('請填寫你的稱呼。', 'error'); return; }
    if (!email.trim()) { showToast('請填寫你的 Email。', 'error'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { showToast('Email 格式不正確，請再確認。', 'error'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: leadName, source: '2026變現指南' }),
      });
      const data = await res.json();
      if (res.ok) { showToast(data.message, 'success'); setEmail(''); setLeadName(''); }
      else showToast(data.error, 'error');
    } catch { showToast('網路錯誤，請稍後再試。', 'error'); }
    finally { setSubmitting(false); }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-50px' },
    transition: { duration: 0.55, ease: EASE },
  };

  /* Parse hero title into lines + highlight */
  const titleLines = (hero.title || '').split('\n');
  const highlightText = hero.titleHighlight || '高獲利 AI 事業';

  /* Trust badges */
  const trustBadges = (hero.trustBadges || '').split(',').map((s: string) => s.trim()).filter(Boolean);

  /* JSON-LD: HomePage + Lead Magnet Offer + FAQPage */
  const homeJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: '老J AI 實驗室 — 教你用 AI 打造不露臉音樂頻道變現',
      description: '不露臉、不唱歌、不懂樂理，也能用 AI 打造會自動賺錢的 YouTube 音樂頻道。老J 親手養出 2 個營利頻道：虛擬歌手唯夏 VXYA 與 ChillNight AI Music，分享完整可複製的變現 SOP。',
      url: 'https://www.oldjailab.com/',
      inLanguage: 'zh-TW',
      isPartOf: { '@type': 'WebSite', name: '老J AI 實驗室', url: 'https://www.oldjailab.com' },
      about: {
        '@type': 'Thing',
        name: 'AI 音樂頻道變現',
        description: '用 AI 打造不露臉 YouTube 音樂頻道並開通營利的可複製方法',
      },
      mainEntity: {
        '@type': 'ItemList',
        name: howItWorks.sectionTitle,
        itemListElement: howItWorks.steps.map((s: any, i: number) => ({
          '@type': 'ListItem', position: i + 1, name: s.title, description: s.description,
        })),
      },
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['h1', '.hero-subtitle'],
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Offer',
      name: '2026 不露臉 AI 音樂頻道變現指南',
      description: leadMagnet.subtitle,
      price: '0',
      priceCurrency: 'TWD',
      availability: 'https://schema.org/InStock',
      url: 'https://www.oldjailab.com/#lead-magnet',
      offeredBy: { '@type': 'Organization', name: '老J AI 實驗室' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.items.map((f: any) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ];

  return (
    <>
      <SEO
        path="/"
        description="不露臉、不唱歌、不懂樂理，也能用 AI 打造會自動賺錢的 YouTube 音樂頻道。老J 親手養出 2 個營利頻道（唯夏 VXYA、ChillNight AI Music），教你完整可複製的不露臉音樂頻道變現 SOP。"
        jsonLd={homeJsonLd}
      />

      {/* ── Hero ─ Night Studio ───────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        aria-label="品牌主視覺"
        className="relative pt-28 pb-24 lg:pt-36 lg:pb-32 px-6 overflow-hidden bg-[#0E0A1F] text-white"
      >
        {/* deep gradient wash */}
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,#2a1458_0%,#160F33_38%,#0E0A1F_75%)]" />
        {/* faint grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:34px_34px] [mask-image:radial-gradient(80%_60%_at_50%_30%,black,transparent)]" />

        {/* mouse-follow spotlight */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(600px circle at ${mousePos.x}% ${mousePos.y}%, rgba(168,85,247,0.22) 0%, rgba(217,70,239,0.12) 40%, transparent 70%)`,
          }}
        />

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[600px] pointer-events-none">
          <motion.div animate={{ scale: [1,1.1,1], opacity:[0.4,0.65,0.4], x:[-50,50,-50] }} transition={{ duration: 10, repeat: Infinity, ease:'easeInOut' }}
            className="absolute top-0 left-0 w-96 h-96 bg-violet-600/40 rounded-full blur-3xl mix-blend-screen" />
          <motion.div animate={{ scale: [1,1.2,1], opacity:[0.3,0.55,0.3], x:[50,-50,50] }} transition={{ duration: 12, repeat: Infinity, ease:'easeInOut', delay:1 }}
            className="absolute top-20 right-0 w-[30rem] h-[30rem] bg-fuchsia-600/35 rounded-full blur-3xl mix-blend-screen" />
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
            <div className="hero-fade inline-flex items-center gap-2 border border-white/15 bg-white/10 backdrop-blur-md rounded-full px-5 py-2 text-xs font-bold tracking-wider text-slate-200 mb-8"
              style={{ animationDelay: '0.1s' }}>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-fuchsia-500" />
              </span>
              {hero.badgeText}
            </div>

            <h1 className="hero-fade text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight leading-[1.15] mb-8 text-white"
              style={{ animationDelay: '0.25s' }}>
              {titleLines.map((line: string, i: number) => (
                <React.Fragment key={i}>
                  {line}
                  {i < titleLines.length - 1 && <br />}
                </React.Fragment>
              ))}
              <span className="relative whitespace-nowrap inline-block mt-2 md:mt-0 ml-2">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">{highlightText}</span>
                <span className="absolute bottom-2 left-0 w-full h-3 md:h-4 bg-fuchsia-500/30 -z-10 origin-left"
                  style={{ animation: 'heroUnderline 0.8s ease-out 0.8s both' }} />
              </span>
            </h1>

            <p className="hero-fade text-lg md:text-xl text-slate-300 mb-10 max-w-2xl leading-relaxed font-medium"
              style={{ animationDelay: '0.4s' }}>
              {hero.subtitle}
            </p>

            <div className="hero-fade flex flex-wrap justify-center lg:justify-start gap-4 items-center"
              style={{ animationDelay: '0.55s' }}>
              <a href="#lead-magnet" className="group bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-8 py-4 rounded-full font-semibold flex items-center gap-2 shadow-lg shadow-fuchsia-500/25 hover:shadow-xl hover:shadow-fuchsia-500/40 hover:-translate-y-1 transition-all duration-300">
                {hero.ctaText} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="#works" className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-full font-medium flex items-center gap-2 hover:bg-white/15 hover:-translate-y-1 transition-all duration-300">
                <Play className="w-4 h-4 fill-current text-fuchsia-300" /> {hero.ctaSecondary}
              </a>
            </div>
          </div>

          {/* Right: Profile Photo (spotlight) */}
          <div className="hero-scale relative shrink-0 order-first lg:order-last" style={{ animationDelay: '0.3s' }}>
            <div className="relative w-64 h-64 md:w-72 md:h-72 lg:w-80 lg:h-80">
              {/* Decorative glow */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/40 to-fuchsia-500/40 blur-3xl scale-125" />
              {/* Gradient ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 p-[3px] shadow-2xl shadow-fuchsia-500/30">
                <div className="w-full h-full rounded-full overflow-hidden bg-[#160F33]">
                  <img
                    src="/images/hero-profile.jpg"
                    alt="老J — AI 音樂頻道變現實戰家"
                    className="w-full h-full object-cover object-top scale-110"
                    loading="eager"
                  />
                </div>
              </div>
              {/* Floating accent badge — 僅在有文字時顯示，避免空白點 */}
              {hero.photoBadge && (
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-2xl px-4 py-2 border border-white/10 whitespace-nowrap"
                style={{ animation: 'heroBadgeBounce 3s ease-in-out infinite' }}>
                <span className="text-sm font-bold text-slate-900">{hero.photoBadge}</span>
              </div>
              )}
            </div>
          </div>
        </div>

        <div className="hero-fade relative z-10 mt-10 lg:mt-12 flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs text-slate-400 font-medium"
          style={{ animationDelay: '1s' }}>
          {trustBadges.map((t: string) => (
            <span key={t}>{t}</span>
          ))}
        </div>

        {/* Equalizer motif */}
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-1 h-20 opacity-30 pointer-events-none" aria-hidden="true">
          {Array.from({ length: 56 }).map((_, i) => (
            <span
              key={i}
              className="eq-bar w-1.5 rounded-t bg-gradient-to-t from-violet-500 to-fuchsia-400"
              style={{
                height: `${20 + ((i * 37) % 80)}%`,
                animationDelay: `${(i % 12) * 0.11}s`,
                animationDuration: `${0.8 + (i % 5) * 0.18}s`,
              }}
            />
          ))}
        </div>
      </section>

      {/* ── 痛點 / 適合誰 ─────────────────────────────────────────────────────── */}
      <section aria-labelledby="fit-title" className="py-16 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-bold tracking-widest text-fuchsia-600 uppercase mb-2">這是為你準備的</p>
          <h2 id="fit-title" className="text-2xl md:text-3xl font-bold tracking-tight">如果你也卡在這些地方</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm">
            <div className="text-sm font-bold text-slate-400 mb-4">你是不是也曾經……</div>
            <ul className="space-y-3 text-[15px] text-slate-700 leading-relaxed">
              <li className="flex gap-3"><span className="text-rose-400 font-bold">✕</span><span>部落格、短影音都試過，流量卻一直起不來</span></li>
              <li className="flex gap-3"><span className="text-rose-400 font-bold">✕</span><span>想做被動收入，卻不知道從哪一步開始</span></li>
              <li className="flex gap-3"><span className="text-rose-400 font-bold">✕</span><span>不想露臉、沒有才藝，覺得自己「做不了內容」</span></li>
              <li className="flex gap-3"><span className="text-rose-400 font-bold">✕</span><span>只有下班後一兩小時，怕投入了卻沒成果</span></li>
            </ul>
          </div>
          <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-7">
            <div className="text-sm font-bold text-violet-600 mb-4">那這套方法正好適合你</div>
            <ul className="space-y-3 text-[15px] text-slate-700 leading-relaxed">
              <li className="flex gap-3"><span className="text-violet-500 font-bold">✓</span><span>想用下班時間，打造會累積的內容資產</span></li>
              <li className="flex gap-3"><span className="text-violet-500 font-bold">✓</span><span>零基礎、不懂樂理、不想露臉都 OK</span></li>
              <li className="flex gap-3"><span className="text-violet-500 font-bold">✓</span><span>願意照 SOP 一步步做，而不是只想快速致富</span></li>
              <li className="flex gap-3"><span className="text-violet-500 font-bold">✓</span><span>想要一條已被驗證、可複製的路，少走彎路</span></li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Works Wall ─ continues night studio ───────────────────────────────── */}
      <section id="works" aria-labelledby="works-title" className="relative bg-[#0E0A1F] text-white px-6 py-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(90%_60%_at_50%_0%,#1d1240_0%,#0E0A1F_70%)]" />
        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="mb-10 text-center">
            <p className="text-xs font-bold tracking-widest text-fuchsia-400 uppercase mb-3">{works.label}</p>
            <h2 id="works-title" className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">{works.sectionTitle}</h2>
            <p className="text-slate-400 max-w-xl mx-auto">{works.sectionSubtitle}</p>
          </motion.div>

          {/* Featured player */}
          <motion.div {...fadeInUp} className="max-w-3xl mx-auto mb-8">
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-fuchsia-900/30 aspect-video bg-black">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube-nocookie.com/embed/${works.featuredId}`}
                title={works.featuredTitle}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p className="text-center text-sm text-slate-400 mt-3">{works.featuredTitle}</p>
          </motion.div>

          {/* Cover grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {works.items.map((w: any, i: number) => (
              <motion.a
                key={i}
                href={`https://www.youtube.com/watch?v=${w.id}`}
                target="_blank"
                rel="noopener noreferrer"
                {...fadeInUp}
                transition={{ duration: 0.5, delay: i * 0.08, ease: EASE }}
                className="group relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 hover:-translate-y-1 hover:border-fuchsia-400/40 transition-all duration-300"
              >
                <div className="aspect-video overflow-hidden">
                  <img src={w.cover} alt={w.title} loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="absolute inset-x-0 top-0 aspect-video flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                  <span className="w-11 h-11 rounded-full bg-white/90 text-slate-900 flex items-center justify-center">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </span>
                </div>
                <div className="p-3">
                  <div className="text-sm font-semibold truncate text-white">{w.title}</div>
                  <div className="text-xs text-slate-400">{w.tag}</div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Proof Channels ────────────────────────────────────────────────────── */}
      <section id="channels" aria-labelledby="channels-title" className="py-14 px-6 max-w-6xl mx-auto border-t border-gray-100">
        <motion.div {...fadeInUp} className="mb-10 text-center">
          <p className="text-xs font-bold tracking-widest text-violet-600 uppercase mb-3">{channels.label}</p>
          <h2 id="channels-title" className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{channels.sectionTitle}</h2>
          <p className="text-gray-500 max-w-xl mx-auto">{channels.sectionSubtitle}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {channels.items.map((c: any, i: number) => (
            <motion.a
              key={i}
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              {...fadeInUp}
              transition={{ duration: 0.55, delay: i * 0.12, ease: EASE }}
              className="group relative flex flex-col p-8 rounded-3xl bg-white border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              <div className={`absolute -right-16 -top-16 w-48 h-48 rounded-full blur-3xl opacity-20 transition-opacity duration-300 group-hover:opacity-40 ${c.accent === 'fuchsia' ? 'bg-fuchsia-400' : 'bg-violet-400'}`} />
              <div className="relative z-10 flex items-center gap-3 mb-5">
                <div className="relative shrink-0">
                  <img src={c.avatar} alt={c.name} className="w-14 h-14 rounded-2xl object-cover shadow-sm" loading="lazy" />
                  <span className={`absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-white ${c.accent === 'fuchsia' ? 'bg-fuchsia-500' : 'bg-violet-500'}`}>
                    <Youtube className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div>
                  <div className="font-bold text-lg text-slate-900">{c.name}</div>
                  <div className="text-xs font-medium text-gray-500">{c.tag}</div>
                </div>
              </div>
              <p className="relative z-10 text-sm text-gray-600 leading-relaxed mb-6 flex-1">{c.desc}</p>
              <div className="relative z-10 flex items-end justify-between">
                <div>
                  <div className="text-3xl font-extrabold tracking-tight text-amber-500">{c.metric}</div>
                  <div className="text-xs font-medium text-gray-500">{c.metricLabel}</div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 group-hover:gap-2.5 transition-all">
                  前往頻道 <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </section>

      {/* ── Student Results ───────────────────────────────────────────────────── */}
      <section id="students" aria-labelledby="students-title" className="py-14 px-6 max-w-6xl mx-auto border-t border-gray-100">
        <motion.div {...fadeInUp} className="mb-10 text-center">
          <p className="text-xs font-bold tracking-widest text-violet-600 uppercase mb-3">{students.label}</p>
          <h2 id="students-title" className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{students.sectionTitle}</h2>
          <p className="text-gray-500 max-w-xl mx-auto">{students.sectionSubtitle}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {students.items.map((s: any, i: number) => (
            <motion.div
              key={i}
              {...fadeInUp}
              transition={{ duration: 0.55, delay: i * 0.12, ease: EASE }}
              className="group flex flex-col p-7 rounded-3xl bg-white border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="relative shrink-0">
                  <img src={s.avatar} alt={s.name} className={`w-16 h-16 rounded-full object-cover ring-2 ${s.accent === 'fuchsia' ? 'ring-fuchsia-100' : 'ring-violet-100'}`} loading="lazy" />
                  <span className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white ${s.accent === 'fuchsia' ? 'bg-fuchsia-500' : 'bg-violet-500'}`}>
                    <Youtube className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-lg text-slate-900 truncate">{s.name}</div>
                  <div className="text-xs font-medium text-gray-500">{s.handle} · {s.niche}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{s.stat}</div>
                </div>
              </div>
              <div className="flex items-start gap-2 rounded-2xl bg-violet-50/70 border border-violet-100 px-4 py-3 mb-5">
                <CheckCircle2 className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700 leading-relaxed font-medium">{s.result}</p>
              </div>
              <a href={s.url} target="_blank" rel="noopener noreferrer"
                className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 group-hover:gap-2.5 transition-all">
                看學員頻道 <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          ))}
        </div>
        <motion.p {...fadeInUp} className="text-center text-xs text-gray-400 mt-6 max-w-2xl mx-auto">
          ※ 以上為實際學員頻道，成果因個人投入時間與執行程度而異，非保證收益。
        </motion.p>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────────── */}
      <section aria-labelledby="how-it-works-title" className="py-14 px-6 max-w-6xl mx-auto border-t border-gray-100">
        <motion.div {...fadeInUp} className="mb-10 text-center">
          <p className="text-xs font-bold tracking-widest text-violet-600 uppercase mb-3">{howItWorks.label}</p>
          <h2 id="how-it-works-title" className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{howItWorks.sectionTitle}</h2>
          <p className="text-gray-500 max-w-xl mx-auto">{howItWorks.sectionSubtitle}</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-10 left-[calc(16.6%+2rem)] right-[calc(16.6%+2rem)] h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
          {howItWorks.steps.map((s: any, i: number) => (
            <motion.div key={i} {...fadeInUp} transition={{ duration: 0.55, delay: i * 0.12, ease:EASE }}
              className="relative flex flex-col items-center text-center p-8 rounded-3xl bg-white border border-gray-100 hover:border-slate-300 hover:shadow-md transition-all group">
              <div className="absolute -top-4 left-8 text-[10px] font-black tracking-widest text-gray-300 group-hover:text-violet-500 transition-colors">{String(i + 1).padStart(2, '0')}</div>
              <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-5 group-hover:bg-gradient-to-br group-hover:from-violet-500 group-hover:to-fuchsia-500 transition-all duration-300 shadow-sm">
                {ICON_MAP[s.icon] || <Target className="w-7 h-7" />}
              </div>
              <h3 className="text-lg font-bold mb-3">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Revenue Proof ─────────────────────────────────────────────────────── */}
      <section id="revenue" aria-labelledby="revenue-title" className="py-14 px-6 max-w-6xl mx-auto border-t border-gray-100">
        <motion.div {...fadeInUp} className="mb-10 text-center">
          <p className="text-xs font-bold tracking-widest text-fuchsia-600 uppercase mb-3">{revenueProof.label}</p>
          <h2 id="revenue-title" className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{revenueProof.sectionTitle}</h2>
          <p className="text-gray-500 max-w-xl mx-auto">{revenueProof.sectionSubtitle}</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6">
          {revenueProof.items.map((r: any, i: number) => (
            <motion.div key={i} {...fadeInUp} transition={{ duration: 0.5, delay: i * 0.1, ease: EASE }}
              className="rounded-3xl border border-gray-100 bg-white overflow-hidden hover:shadow-md transition-all">
              <div className="h-44 bg-slate-900/5 flex items-center justify-center overflow-hidden p-3">
                <img src={r.img} alt={r.title} loading="lazy" className="max-h-full max-w-full object-contain rounded-lg" />
              </div>
              <div className="p-6">
                <div className="text-xs font-medium text-gray-400 mb-1">{r.tag}</div>
                <div className="font-bold text-slate-900 mb-1">{r.title}</div>
                <div className="text-2xl font-extrabold text-amber-500">{r.amount}</div>
              </div>
            </motion.div>
          ))}
        </div>
        <motion.p {...fadeInUp} className="text-center text-xs text-gray-400 mt-6 max-w-2xl mx-auto">{revenueProof.note}</motion.p>
      </section>

      {/* ── Course Offer ──────────────────────────────────────────────────────── */}
      <section id="course" aria-labelledby="course-title" className="py-14 px-6 max-w-6xl mx-auto border-t border-gray-100">
        <motion.div {...fadeInUp}
          className="rounded-[2rem] overflow-hidden bg-gradient-to-br from-[#160F33] to-[#6D28D9] text-white relative">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:28px_28px]" />
          <div className="relative z-10 p-10 md:p-14 flex flex-col lg:flex-row gap-10 lg:gap-14">
            <div className="flex-1">
              <p className="text-amber-400 text-xs font-bold tracking-widest uppercase mb-3">{course.label}</p>
              <h2 id="course-title" className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{course.sectionTitle}</h2>
              <p className="text-slate-300 leading-relaxed text-sm mb-6 max-w-xl">{course.sectionSubtitle}</p>
              <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
                {course.features.map((f: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:w-72 shrink-0 flex flex-col justify-center">
              <div className="rounded-3xl bg-white/10 border border-white/15 backdrop-blur-sm p-7 text-center">
                <div className="text-xs font-medium text-amber-300 mb-1">{course.priceLabel}</div>
                <div className="text-4xl font-extrabold tracking-tight mb-1">{course.price}</div>
                <div className="text-sm text-slate-400 line-through mb-5">{course.priceOriginal}</div>
                <a href={course.url} target="_blank" rel="noopener noreferrer"
                  className="block w-full bg-amber-400 text-slate-900 font-bold py-4 rounded-full hover:bg-amber-300 transition-all shadow-lg shadow-amber-500/20">
                  {course.ctaText}
                </a>
                <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">{course.priceNote}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── 安心保證 / 風險逆轉 ───────────────────────────────────────────────── */}
      <section aria-labelledby="guarantee-title" className="py-10 px-6 max-w-5xl mx-auto">
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-8 md:p-10 text-center">
          <div className="text-xs font-bold tracking-widest text-emerald-600 uppercase mb-3">安心入手 · 0 壓力</div>
          <h2 id="guarantee-title" className="text-2xl md:text-3xl font-bold tracking-tight mb-3">先免費試，覺得有料再決定</h2>
          <p className="text-slate-600 leading-relaxed max-w-2xl mx-auto mb-8">不用一開始就掏錢冒險——先領免費指南，覺得這套打法對你有用，再考慮完整課程。買了之後也不是丟著不管：</p>
          <div className="grid sm:grid-cols-3 gap-5 text-left max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl p-5 border border-emerald-100">
              <div className="text-emerald-600 font-bold text-sm mb-1">先試再買</div>
              <p className="text-sm text-slate-600 leading-relaxed">免費指南先看，判斷適不適合你，零風險。</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-emerald-100">
              <div className="text-emerald-600 font-bold text-sm mb-1">卡關有人答</div>
              <p className="text-sm text-slate-600 leading-relaxed">專屬社群陪你做，操作卡住隨時發問。</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-emerald-100">
              <div className="text-emerald-600 font-bold text-sm mb-1">持續更新</div>
              <p className="text-sm text-slate-600 leading-relaxed">未來新的被動收入教學，免費拿。</p>
            </div>
          </div>
          <div className="mt-8">
            <a href="/#lead-magnet" className="inline-block bg-[#6D28D9] text-white font-bold text-sm px-7 py-3.5 rounded-full hover:bg-[#5b21b6] transition-colors">先免費領取指南 &rarr;</a>
          </div>
        </div>
      </section>

      {/* 最新文章區塊已移除（依需求精簡首頁） */}

      {/* 電子書 Banner「用 AI 打造你的第一個被動收入」已移除 */}

      {/* ── Lead Magnet ───────────────────────────────────────────────────────── */}
      <section id="lead-magnet" aria-label="免費下載 AI 變現全景地圖" className="py-6 px-6 max-w-6xl mx-auto">
        <motion.div {...fadeInUp}
          className="bg-gradient-to-br from-slate-900 to-[#6D28D9] rounded-[2rem] p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px]" />
          <div className="max-w-xl relative z-10">
            <p className="text-violet-400 text-xs font-bold tracking-widest uppercase mb-3">{leadMagnet.label}</p>
            <h2 className="text-3xl font-bold mb-4 tracking-tight text-white">{leadMagnet.title}</h2>
            <p className="text-slate-300 mb-5 leading-relaxed text-sm">{leadMagnet.subtitle}</p>
            <ul className="mb-7 space-y-2">
              {leadMagnet.bullets.map((b: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" /> {b}
                </li>
              ))}
            </ul>
            <form onSubmit={handleSubscribe} aria-label="領取免費指南" className="space-y-3">
              <input
                type="text"
                value={leadName}
                onChange={e => setLeadName(e.target.value)}
                placeholder="你的稱呼（必填）"
                aria-label="你的稱呼"
                required
                autoComplete="name"
                className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-400 rounded-full px-6 py-4 focus:outline-none focus:border-white/60 focus:bg-white/15 transition-all text-sm"
              />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="你的 Email（必填，立即收到 PDF）"
                aria-label="Email"
                required
                autoComplete="email"
                className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-400 rounded-full px-6 py-4 focus:outline-none focus:border-white/60 focus:bg-white/15 transition-all text-sm"
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-amber-400 text-slate-900 px-8 py-4 rounded-full font-bold hover:bg-amber-300 transition-all text-sm disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
              >
                {submitting ? '發送中…' : leadMagnet.buttonText}
              </button>
              <p className="text-xs text-slate-400 text-center">稱呼與 Email 為必填，送出後立即將 PDF 寄到你的信箱</p>
            </form>
            <p className="text-xs text-slate-500 mt-4 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> {leadMagnet.privacyText}
            </p>
            <a
              href="https://line.me/ti/g2/WBNqN2jcZTzcmIPz1J5LyhEsrjn7mVrosUJHHg?utm_source=invitation&utm_medium=link_copy&utm_campaign=default"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 bg-white/10 border border-white/20 text-white px-6 py-3 rounded-full font-medium hover:bg-violet-500 hover:border-violet-500 transition-all text-sm"
            >
              <Users className="w-4 h-4" /> 加入社群
            </a>
          </div>
          <div className="w-full md:w-52 shrink-0 relative z-10">
            <div className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-white to-slate-100 shadow-2xl shadow-black/30 p-5 flex flex-col rotate-2 hover:rotate-0 transition-transform duration-300">
              <div className="text-[10px] font-extrabold text-fuchsia-600 tracking-widest mb-2">FREE PDF</div>
              <div className="font-bold text-slate-900 text-sm leading-snug mb-3">{leadMagnet.boxTitle}</div>
              <div className="space-y-1.5 flex-1">
                <div className="h-1.5 w-full bg-slate-200 rounded" />
                <div className="h-1.5 w-5/6 bg-slate-200 rounded" />
                <div className="h-1.5 w-full bg-slate-200 rounded" />
                <div className="h-1.5 w-2/3 bg-slate-200 rounded" />
                <div className="h-1.5 w-4/5 bg-slate-200 rounded" />
              </div>
              <div className="mt-3 inline-flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                <BookOpen className="w-3 h-3" /> {leadMagnet.boxSubtitle}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 免費 AI 工具箱區塊已移除（依需求精簡首頁） */}

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
              <div className="text-5xl font-light tracking-tighter mb-2 text-[#1A1A1A] group-hover:text-[#6D28D9] transition-colors">
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
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(124,58,237,0.08),rgba(217,70,239,0.08))]" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="flex-1 text-center md:text-left">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0">
                <Rocket className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                想更快讓你的音樂頻道開通營利？
              </h2>
              <p className="text-gray-300 leading-relaxed max-w-lg">
                不管是頻道定位、AI 製作流程還是變現結構設計，老 J 都能幫你少走半年彎路。預約一次免費諮詢，聊聊你的頻道。
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-white text-slate-900 px-10 py-4 rounded-full font-medium hover:bg-violet-50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                立即預約免費諮詢 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────────── */}
      <section id="faq" aria-labelledby="faq-title" className="py-14 px-6 max-w-3xl mx-auto border-t border-gray-100">
        <motion.div {...fadeInUp} className="mb-8 text-center">
          <p className="text-xs font-bold tracking-widest text-violet-600 uppercase mb-3">{faq.label}</p>
          <h2 id="faq-title" className="text-3xl md:text-4xl font-bold tracking-tight">{faq.sectionTitle}</h2>
        </motion.div>
        <div className="space-y-3">
          {faq.items.map((f: any, i: number) => (
            <motion.details key={i} {...fadeInUp} transition={{ duration: 0.45, delay: i * 0.06, ease: EASE }}
              className="group rounded-2xl border border-gray-200 bg-white px-6 py-4 open:shadow-sm open:border-violet-200 transition-all">
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden font-bold text-slate-900">
                {f.q}
                <ChevronDown className="w-5 h-5 text-violet-500 shrink-0 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">{f.a}</p>
            </motion.details>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────────────── */}
      <section aria-label="加入行動呼籲" className="py-10 px-6 max-w-6xl mx-auto mb-6">
        <motion.div {...fadeInUp}
          className="rounded-3xl border border-gray-100 bg-slate-50 p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(124,58,237,0.04),rgba(217,70,239,0.04))]" />
          <div className="relative z-10">
            <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Zap className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">{ctaBanner.title}</h2>
            <p className="text-gray-600 mb-8 max-w-xl mx-auto">{ctaBanner.subtitle}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#lead-magnet" className="inline-flex items-center gap-2 bg-slate-900 text-white px-10 py-4 rounded-full font-medium hover:bg-[#6D28D9] hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
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

      {/* ── Sticky 免費指南 CTA（冷流量先導向免費磁鐵，不直接推課程）──────────────── */}
      <AnimatePresence>
        {showBar && !barDismissed && (
          <motion.div
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="fixed bottom-20 sm:bottom-5 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-xl"
          >
            <div className="flex items-center gap-3 rounded-2xl bg-[#160F33]/95 backdrop-blur-md border border-white/10 shadow-2xl shadow-fuchsia-900/40 pl-4 pr-3 py-3">
              <div className="min-w-0 flex-1">
                <div className="text-[11px] text-fuchsia-300 font-medium">限時免費 · 入門指南</div>
                <div className="text-sm text-white font-bold truncate">
                  不露臉 AI 音樂頻道變現指南 · <span className="text-amber-400">免費</span>
                </div>
              </div>
              <a
                href="#lead-magnet"
                className="shrink-0 bg-amber-400 text-slate-900 text-sm font-bold px-4 py-2.5 rounded-full hover:bg-amber-300 transition-colors whitespace-nowrap"
              >
                免費領取
              </a>
              <button
                onClick={() => setBarDismissed(true)}
                aria-label="關閉課程提示"
                className="shrink-0 text-slate-400 hover:text-white transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
