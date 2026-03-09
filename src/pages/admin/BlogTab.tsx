import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus, Edit3, Trash2, Eye, EyeOff, Save, X, Upload, Image as ImageIcon,
  ArrowLeft, Clock, Tag, Folder, FileText, Search, BarChart3,
} from 'lucide-react';

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image: string;
  category: string;
  tags: string; // JSON array string
  status: 'draft' | 'published';
  author: string;
  view_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

const CATEGORIES = ['一般', '技術教學', 'AI 應用', '創業心得', '工具介紹', '案例分析'];

const EMPTY_POST: Omit<BlogPost, 'id' | 'view_count' | 'created_at' | 'updated_at' | 'published_at'> = {
  slug: '',
  title: '',
  excerpt: '',
  content: '',
  cover_image: '',
  category: '一般',
  tags: '[]',
  status: 'draft',
  author: '老J',
};

export default function BlogTab({ api }: { api: (path: string, opts?: RequestInit) => Promise<Response> }) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published'>('all');
  const [coverUploading, setCoverUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Load Posts ─────────────────────────────────────────────────────────── */
  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api('/api/admin/blog');
      if (res.ok) setPosts(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  }, [api]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  /* ── Filtered Posts ─────────────────────────────────────────────────────── */
  const filtered = posts.filter(p => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    }
    return true;
  });

  /* ── Create / Edit ──────────────────────────────────────────────────────── */
  const startCreate = () => {
    setEditing({ ...EMPTY_POST, id: 0, view_count: 0, created_at: '', updated_at: '', published_at: null } as BlogPost);
    setIsNew(true);
  };

  const startEdit = (post: BlogPost) => {
    setEditing({ ...post });
    setIsNew(false);
  };

  const cancelEdit = () => { setEditing(null); setIsNew(false); };

  /* ── Save ────────────────────────────────────────────────────────────────── */
  const savePost = async () => {
    if (!editing) return;
    if (!editing.title.trim()) { alert('請輸入文章標題'); return; }
    setSaving(true);
    try {
      let parsedTags: string[] = [];
      try { parsedTags = typeof editing.tags === 'string' ? JSON.parse(editing.tags) : editing.tags; } catch { parsedTags = []; }

      const body = {
        title: editing.title.trim(),
        slug: editing.slug.trim() || undefined,
        excerpt: editing.excerpt.trim(),
        content: editing.content,
        cover_image: editing.cover_image,
        category: editing.category,
        tags: parsedTags,
        status: editing.status,
        author: editing.author || '老J',
      };

      const url = isNew ? '/api/admin/blog' : `/api/admin/blog/${editing.id}`;
      const method = isNew ? 'POST' : 'PUT';
      const res = await api(url, { method, body: JSON.stringify(body) });
      if (res.ok) {
        await loadPosts();
        setEditing(null);
        setIsNew(false);
      } else {
        const data = await res.json().catch(() => ({ error: '儲存失敗' }));
        alert(data.error || '儲存失敗');
      }
    } catch { alert('儲存失敗，請稍後再試。'); }
    setSaving(false);
  };

  /* ── Delete ──────────────────────────────────────────────────────────────── */
  const deletePost = async (id: number) => {
    if (!confirm('確定要刪除此文章？此操作無法復原。')) return;
    try {
      const res = await api(`/api/admin/blog/${id}`, { method: 'DELETE' });
      if (res.ok) loadPosts();
    } catch { /* ignore */ }
  };

  /* ── Toggle Status ──────────────────────────────────────────────────────── */
  const toggleStatus = async (post: BlogPost) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    try {
      const res = await api(`/api/admin/blog/${post.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...post, tags: JSON.parse(post.tags || '[]'), status: newStatus }),
      });
      if (res.ok) loadPosts();
    } catch { /* ignore */ }
  };

  /* ── Cover Upload ───────────────────────────────────────────────────────── */
  const uploadCover = async (file: File) => {
    setCoverUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('/api/admin/upload/blog-cover', {
        method: 'POST',
        headers: { Authorization: `Bearer ${sessionStorage.getItem('laoj_admin_token')}` },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setEditing(prev => prev ? { ...prev, cover_image: data.imageUrl } : prev);
      } else {
        const data = await res.json().catch(() => ({ error: '上傳失敗' }));
        alert(data.error || '上傳失敗');
      }
    } catch { alert('上傳失敗'); }
    setCoverUploading(false);
  };

  /* ── Tag Input Handler ──────────────────────────────────────────────────── */
  const tagsArray = (() => {
    if (!editing) return [];
    try { return typeof editing.tags === 'string' ? JSON.parse(editing.tags) : editing.tags; }
    catch { return []; }
  })();

  const addTag = (tag: string) => {
    const t = tag.trim();
    if (!t || tagsArray.includes(t)) return;
    setEditing(prev => prev ? { ...prev, tags: JSON.stringify([...tagsArray, t]) } : prev);
  };

  const removeTag = (tag: string) => {
    setEditing(prev => prev ? { ...prev, tags: JSON.stringify(tagsArray.filter((t: string) => t !== tag)) } : prev);
  };

  /* ── Render: Editor ─────────────────────────────────────────────────────── */
  if (editing) {
    return (
      <div className="space-y-6">
        {/* Editor Header */}
        <div className="flex items-center justify-between">
          <button onClick={cancelEdit} className="flex items-center gap-2 text-sm text-gray-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" /> 返回文章列表
          </button>
          <div className="flex items-center gap-3">
            <select
              value={editing.status}
              onChange={e => setEditing({ ...editing, status: e.target.value as 'draft' | 'published' })}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-slate-400"
            >
              <option value="draft">草稿</option>
              <option value="published">已發布</option>
            </select>
            <button onClick={savePost} disabled={saving}
              className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1E3A8A] transition-colors disabled:opacity-60">
              <Save className="w-4 h-4" /> {saving ? '儲存中…' : '儲存文章'}
            </button>
          </div>
        </div>

        {/* Main Editor Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Title */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">文章標題 *</label>
              <input value={editing.title}
                onChange={e => setEditing({ ...editing, title: e.target.value })}
                placeholder="輸入文章標題…"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg font-medium focus:outline-none focus:border-slate-400 bg-white" />
            </div>

            {/* Slug */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">網址代稱 (slug)</label>
              <input value={editing.slug}
                onChange={e => setEditing({ ...editing, slug: e.target.value })}
                placeholder="自動產生 (可自訂)"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-400 bg-white font-mono" />
            </div>

            {/* Excerpt */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">摘要</label>
              <textarea value={editing.excerpt}
                onChange={e => setEditing({ ...editing, excerpt: e.target.value })}
                rows={2}
                placeholder="文章簡短描述，會顯示在列表頁面…"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-400 bg-white resize-none" />
            </div>

            {/* Content */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                文章內容 <span className="text-gray-400 font-normal">(支援 Markdown 語法)</span>
              </label>
              <textarea value={editing.content}
                onChange={e => setEditing({ ...editing, content: e.target.value })}
                rows={20}
                placeholder={'# 標題\n\n在這裡撰寫你的文章內容…\n\n支援 **粗體**、*斜體*、`程式碼`、清單等 Markdown 語法。'}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-400 bg-white resize-y font-mono leading-relaxed" />
            </div>
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-5">
            {/* Cover Image */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <label className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" /> 封面圖片
              </label>
              {editing.cover_image ? (
                <div className="relative group mb-3">
                  <img src={editing.cover_image} alt="封面" className="w-full aspect-video object-cover rounded-xl border border-gray-100" />
                  <button onClick={() => setEditing({ ...editing, cover_image: '' })}
                    className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="aspect-video bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center mb-3">
                  <div className="text-center text-gray-400">
                    <ImageIcon className="w-8 h-8 mx-auto mb-1" />
                    <p className="text-xs">尚未上傳封面</p>
                  </div>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                onChange={e => { if (e.target.files?.[0]) uploadCover(e.target.files[0]); e.target.value = ''; }} />
              <button onClick={() => fileInputRef.current?.click()} disabled={coverUploading}
                className="w-full flex items-center justify-center gap-2 text-sm border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition-colors disabled:opacity-60">
                <Upload className="w-4 h-4" /> {coverUploading ? '上傳中…' : '上傳圖片'}
              </button>
            </div>

            {/* Category */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <label className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5" /> 分類
              </label>
              <select value={editing.category}
                onChange={e => setEditing({ ...editing, category: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-slate-400">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Tags */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <label className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> 標籤
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {tagsArray.map((t: string) => (
                  <span key={t} className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-lg">
                    {t}
                    <button onClick={() => removeTag(t)} className="hover:text-red-500 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <input placeholder="輸入標籤後按 Enter"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-slate-400 bg-white" />
            </div>

            {/* Author */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <label className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> 作者
              </label>
              <input value={editing.author}
                onChange={e => setEditing({ ...editing, author: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-slate-400 bg-white" />
            </div>

            {/* Post Info (only for existing posts) */}
            {!isNew && editing.id > 0 && (
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 text-xs text-gray-500 space-y-2">
                <div className="flex justify-between"><span>瀏覽次數</span><span className="font-medium text-slate-700">{editing.view_count}</span></div>
                <div className="flex justify-between"><span>建立時間</span><span>{editing.created_at?.slice(0, 16)}</span></div>
                <div className="flex justify-between"><span>更新時間</span><span>{editing.updated_at?.slice(0, 16)}</span></div>
                {editing.published_at && <div className="flex justify-between"><span>發布時間</span><span>{editing.published_at.slice(0, 16)}</span></div>}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── Render: Post List ──────────────────────────────────────────────────── */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">部落格管理</h2>
          <p className="text-sm text-gray-400 mt-1">管理文章的新增、編輯、發布與刪除</p>
        </div>
        <button onClick={startCreate}
          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1E3A8A] transition-colors">
          <Plus className="w-4 h-4" /> 新增文章
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="搜尋文章標題或分類…"
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-slate-400 bg-white" />
        </div>
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
          {(['all', 'published', 'draft'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${filterStatus === s ? 'bg-slate-900 text-white' : 'text-gray-500 hover:text-slate-900'}`}>
              {s === 'all' ? '全部' : s === 'published' ? '已發布' : '草稿'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex gap-6 text-sm text-gray-500">
        <span>共 <strong className="text-slate-900">{posts.length}</strong> 篇文章</span>
        <span>已發布 <strong className="text-emerald-600">{posts.filter(p => p.status === 'published').length}</strong></span>
        <span>草稿 <strong className="text-amber-600">{posts.filter(p => p.status === 'draft').length}</strong></span>
      </div>

      {/* Posts Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">載入中…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl">
          <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm mb-4">{search || filterStatus !== 'all' ? '沒有符合條件的文章' : '尚未建立任何文章'}</p>
          {!search && filterStatus === 'all' && (
            <button onClick={startCreate} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              建立第一篇文章 &rarr;
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-400 font-medium">
                  <th className="py-3 px-5">文章</th>
                  <th className="py-3 px-4">分類</th>
                  <th className="py-3 px-4">狀態</th>
                  <th className="py-3 px-4">
                    <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" /> 瀏覽</span>
                  </th>
                  <th className="py-3 px-4">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 日期</span>
                  </th>
                  <th className="py-3 px-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(post => (
                  <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        {post.cover_image ? (
                          <img src={post.cover_image} alt="" className="w-12 h-8 rounded-lg object-cover border border-gray-100 shrink-0" />
                        ) : (
                          <div className="w-12 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4 text-gray-300" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-medium text-slate-900 truncate max-w-xs">{post.title}</div>
                          <div className="text-xs text-gray-400 truncate max-w-xs">/blog/{post.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg">{post.category}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button onClick={() => toggleStatus(post)}
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg transition-colors ${
                          post.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                        }`}>
                        {post.status === 'published' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {post.status === 'published' ? '已發布' : '草稿'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500">{post.view_count}</td>
                    <td className="py-3.5 px-4 text-gray-400 text-xs whitespace-nowrap">
                      {(post.published_at || post.created_at)?.slice(0, 10)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => startEdit(post)} title="編輯"
                          className="p-2 text-gray-400 hover:text-slate-900 hover:bg-gray-100 rounded-lg transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deletePost(post.id)} title="刪除"
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
