import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Clock, Eye, ArrowRight, Search, Tag, Folder } from 'lucide-react';
import SEO from '../components/SEO';

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  cover_image: string;
  category: string;
  tags: string;
  author: string;
  view_count: number;
  created_at: string;
  published_at: string | null;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
};

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('全部');

  useEffect(() => {
    fetch('/api/blog')
      .then(r => r.ok ? r.json() : [])
      .then(setPosts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* ── Derive Categories ──────────────────────────────────────────────────── */
  const categories = ['全部', ...Array.from(new Set(posts.map(p => p.category)))];

  /* ── Filter ──────────────────────────────────────────────────────────────── */
  const filtered = posts.filter(p => {
    if (activeCategory !== '全部' && p.category !== activeCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q);
    }
    return true;
  });

  /* ── Format Date ─────────────────────────────────────────────────────────── */
  const formatDate = (date: string | null) => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  };

  /* ── JSON-LD ─────────────────────────────────────────────────────────────── */
  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: '老J AI 實驗室 部落格',
    description: '分享 AI 自動化實戰經驗、創業心得與工具教學。',
    url: 'https://www.oldjailab.com/blog',
    author: {
      '@type': 'Person',
      name: '老J',
    },
  };

  return (
    <article className="py-20 px-6 max-w-6xl mx-auto">
      <SEO
        title="部落格 — 老J AI 實驗室"
        description="分享 AI 自動化實戰經驗、創業心得與工具教學。從零到一的 AI 變現之路。"
        path="/blog"
        jsonLd={blogJsonLd}
      />

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <motion.div className="text-center mb-16" initial="initial" animate="animate"
        variants={{ initial: { opacity: 0 }, animate: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } } }}>
        <motion.p variants={fadeInUp} className="text-xs font-bold tracking-widest text-blue-600 uppercase mb-4">Blog</motion.p>
        <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          老 J 的實戰筆記
        </motion.h1>
        <motion.p variants={fadeInUp} className="text-gray-500 max-w-lg mx-auto">
          AI 自動化實戰經驗、創業心得與工具教學，從零到一的 AI 變現之路。
        </motion.p>
      </motion.div>

      {/* ── Search & Category Filter ────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-10">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="搜尋文章…"
            className="w-full border border-gray-200 rounded-full pl-11 pr-5 py-3 text-sm focus:outline-none focus:border-slate-400 bg-white" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2.5 rounded-full text-xs font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-slate-900'
              }`}>
              {cat}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Post Grid ──────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden animate-pulse">
              <div className="aspect-video bg-gray-100" />
              <div className="p-6 space-y-3">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-50 rounded w-full" />
                <div className="h-3 bg-gray-50 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center py-20">
          <p className="text-gray-400 mb-2">{posts.length === 0 ? '尚未發布任何文章' : '沒有符合條件的文章'}</p>
          {search && (
            <button onClick={() => setSearch('')} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              清除搜尋
            </button>
          )}
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post, i) => (
            <motion.article key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link to={`/blog/${post.slug}`}
                className="group block bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-gray-200 hover:shadow-md transition-all duration-300">
                {/* Cover */}
                {post.cover_image ? (
                  <div className="aspect-video overflow-hidden">
                    <img src={post.cover_image} alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                    <span className="text-4xl font-bold text-slate-200">{post.title.charAt(0)}</span>
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                      <Folder className="w-3 h-3" /> {post.category}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatDate(post.published_at)}
                    </span>
                  </div>

                  <h2 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2 group-hover:text-[#1E3A8A] transition-colors">
                    {post.title}
                  </h2>

                  {post.excerpt && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">{post.excerpt}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {post.view_count} 次瀏覽
                    </span>
                    <span className="text-sm font-medium text-slate-900 flex items-center gap-1 group-hover:text-[#1E3A8A] group-hover:gap-2 transition-all">
                      閱讀更多 <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      )}
    </article>
  );
}
