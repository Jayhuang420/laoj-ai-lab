import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Clock, Eye, User, Folder, Tag, Share2 } from 'lucide-react';
import SEO from '../components/SEO';

interface BlogPostData {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image: string;
  category: string;
  tags: string;
  status: string;
  author: string;
  view_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

/* ── Simple Markdown → HTML ───────────────────────────────────────────────── */
function renderMarkdown(md: string): string {
  let html = md
    // Escape HTML (basic)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Code blocks (```)
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang, code) =>
      `<pre class="bg-slate-900 text-slate-100 rounded-xl p-5 overflow-x-auto text-sm leading-relaxed my-6"><code class="language-${lang}">${code.trim()}</code></pre>`)
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-slate-800 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-xl my-6 max-w-full" />')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-700 underline underline-offset-2">$1</a>')
    // Headers
    .replace(/^#### (.+)$/gm, '<h4 class="text-lg font-bold text-slate-900 mt-8 mb-3">$1</h4>')
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold text-slate-900 mt-10 mb-4">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-slate-900 mt-12 mb-4">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold text-slate-900 mt-12 mb-6">$1</h1>')
    // Bold & Italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    // Strikethrough
    .replace(/~~(.+?)~~/g, '<del class="line-through text-gray-400">$1</del>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr class="my-8 border-gray-200" />')
    // Blockquote
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-blue-400 bg-blue-50/50 pl-4 py-3 pr-4 my-6 text-gray-700 rounded-r-xl italic">$1</blockquote>')
    // Unordered list
    .replace(/^[-*] (.+)$/gm, '<li class="ml-6 list-disc text-gray-600 mb-1.5">$1</li>')
    // Ordered list
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-6 list-decimal text-gray-600 mb-1.5">$1</li>')
    // Paragraphs (double newline)
    .replace(/\n\n/g, '</p><p class="text-gray-600 leading-relaxed mb-4">')
    // Single newline within paragraphs
    .replace(/\n/g, '<br />');

  // Wrap consecutive <li> items in <ul> / <ol>
  html = html.replace(/((?:<li class="ml-6 list-disc[^>]*>.*?<\/li>\s*)+)/g, '<ul class="my-4">$1</ul>');
  html = html.replace(/((?:<li class="ml-6 list-decimal[^>]*>.*?<\/li>\s*)+)/g, '<ol class="my-4">$1</ol>');

  return `<p class="text-gray-600 leading-relaxed mb-4">${html}</p>`;
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    fetch(`/api/blog/${slug}`)
      .then(r => {
        if (!r.ok) { setNotFound(true); return null; }
        return r.json();
      })
      .then(data => { if (data) setPost(data); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const contentHtml = useMemo(() => {
    if (!post?.content) return '';
    const trimmed = post.content.trim();
    // New articles saved as HTML from TipTap start with '<'
    if (trimmed.startsWith('<')) {
      // Fix escaped video tags from old insertContent bug
      return trimmed
        .replace(
          /&lt;div data-video-wrapper="true"&gt;\s*&lt;video([^]*?)&gt;\s*&lt;\/video&gt;\s*&lt;\/div&gt;/g,
          (_m, attrs) => {
            const src = attrs.match(/src="([^"]+)"/)?.[1] || '';
            return `<video controls playsinline class="blog-video" src="${src}"></video>`;
          }
        )
        .replace(
          /&lt;video([^]*?)&gt;\s*&lt;\/video&gt;/g,
          (_m, attrs) => {
            const src = attrs.match(/src="([^"]+)"/)?.[1] || '';
            return `<video controls playsinline class="blog-video" src="${src}"></video>`;
          }
        );
    }
    // Legacy articles: convert Markdown → HTML
    return renderMarkdown(post.content);
  }, [post?.content]);

  const parsedTags = useMemo(() => {
    if (!post?.tags) return [];
    try { return JSON.parse(post.tags); } catch { return []; }
  }, [post?.tags]);

  const formatDate = (date: string | null) => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  /* ── Loading ─────────────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="py-20 px-6 max-w-3xl mx-auto animate-pulse">
        <div className="h-8 bg-gray-100 rounded w-3/4 mb-4" />
        <div className="h-4 bg-gray-50 rounded w-1/2 mb-8" />
        <div className="aspect-video bg-gray-100 rounded-2xl mb-8" />
        <div className="space-y-3">
          <div className="h-4 bg-gray-50 rounded w-full" />
          <div className="h-4 bg-gray-50 rounded w-5/6" />
          <div className="h-4 bg-gray-50 rounded w-4/6" />
        </div>
      </div>
    );
  }

  /* ── 404 ──────────────────────────────────────────────────────────────────── */
  if (notFound || !post) {
    return (
      <div className="py-20 px-6 max-w-3xl mx-auto text-center">
        <SEO title="找不到文章" path={`/blog/${slug}`} noindex />
        <h1 className="text-4xl font-bold text-slate-900 mb-4">找不到文章</h1>
        <p className="text-gray-500 mb-8">這篇文章可能已被移除或尚未發布。</p>
        <Link to="/blog"
          className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-full font-medium hover:bg-[#1E3A8A] transition-colors">
          <ArrowLeft className="w-4 h-4" /> 返回部落格
        </Link>
      </div>
    );
  }

  /* ── JSON-LD ─────────────────────────────────────────────────────────────── */
  // Strip HTML tags to get plain text for articleBody
  const plainText = contentHtml.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  const articleBody = plainText.length > 300 ? plainText.slice(0, 300) + '…' : plainText;

  const postJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.cover_image || undefined,
    articleBody,
    wordCount: plainText.length,
    author: { '@type': 'Person', name: post.author || '老J' },
    datePublished: post.published_at,
    dateModified: post.updated_at,
    url: `https://www.oldjailab.com/blog/${post.slug}`,
    publisher: {
      '@type': 'Organization',
      name: '老J AI 實驗室',
      url: 'https://www.oldjailab.com',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.oldjailab.com/blog/${post.slug}`,
    },
  };

  // BreadcrumbList for rich snippets
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '首頁', item: 'https://www.oldjailab.com/' },
      { '@type': 'ListItem', position: 2, name: '部落格', item: 'https://www.oldjailab.com/blog' },
      { '@type': 'ListItem', position: 3, name: post.title, item: `https://www.oldjailab.com/blog/${post.slug}` },
    ],
  };

  return (
    <article className="py-20 px-6">
      <SEO
        title={`${post.title} — 老J AI 實驗室`}
        description={post.excerpt || post.title}
        path={`/blog/${post.slug}`}
        ogType="article"
        jsonLd={[postJsonLd, breadcrumbJsonLd]}
      />

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {/* Back Link */}
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-slate-900 transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> 返回部落格
          </Link>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
              <Folder className="w-3 h-3" /> {post.category}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1.5">
              <Clock className="w-3 h-3" /> {formatDate(post.published_at)}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1.5">
              <Eye className="w-3 h-3" /> {post.view_count} 次瀏覽
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1.5">
              <User className="w-3 h-3" /> {post.author}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-slate-900 leading-tight mb-6">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-lg text-gray-500 leading-relaxed mb-8">{post.excerpt}</p>
          )}
        </motion.div>
      </div>

      {/* ── Cover Image ─────────────────────────────────────────────────────── */}
      {post.cover_image && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-4xl mx-auto mb-12">
          <img src={post.cover_image} alt={post.title}
            className="w-full rounded-2xl border border-gray-100 shadow-sm" />
        </motion.div>
      )}

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-3xl mx-auto">
        <div className="prose-custom" dangerouslySetInnerHTML={{ __html: contentHtml }} />

        {/* ── Tags ───────────────────────────────────────────────────────────── */}
        {parsedTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-12 pt-8 border-t border-gray-100">
            <Tag className="w-4 h-4 text-gray-400" />
            {parsedTags.map((tag: string) => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full">{tag}</span>
            ))}
          </div>
        )}

        {/* ── Share ──────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mt-8 pt-8 border-t border-gray-100">
          <Link to="/blog" className="text-sm text-gray-400 hover:text-slate-900 transition-colors flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> 返回部落格
          </Link>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: post.title, url: shareUrl }).catch(() => {});
              } else {
                navigator.clipboard.writeText(shareUrl).then(() => alert('已複製連結！')).catch(() => {});
              }
            }}
            className="text-sm text-gray-400 hover:text-slate-900 transition-colors flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" /> 分享文章
          </button>
        </div>
      </motion.div>
    </article>
  );
}
