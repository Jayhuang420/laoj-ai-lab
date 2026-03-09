import { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Save, Plus, Trash2, RefreshCw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const DEFAULTS = {
  brandName: '老 J AI 實驗室',
  copyright: '© {year} Old J AI Lab. All rights reserved.',
  links: [
    { label: 'Twitter', url: 'https://twitter.com/laojailab' },
    { label: 'YouTube', url: 'https://youtube.com/@laojailab' },
    { label: 'Email', url: 'mailto:contact@laojailab.com' },
    { label: '合作洽談', url: '/contact' },
  ],
};

export type FooterData = typeof DEFAULTS;

export default function FooterTab({ api }: { api: (path: string, opts?: RequestInit) => Promise<Response> }) {
  const { showToast } = useToast();
  const [form, setForm] = useState(DEFAULTS);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api('/api/content/footer');
      if (res.ok) {
        const json = await res.json();
        if (json.main) setForm({ ...DEFAULTS, ...json.main });
      }
    } catch { /* ignore */ }
  }, [api]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await api('/api/admin/content/footer/main', {
        method: 'PUT',
        body: JSON.stringify({ content: form }),
      });
      if (res.ok) showToast('頁尾已儲存', 'success');
      else showToast('儲存失敗', 'error');
    } catch { showToast('儲存失敗', 'error'); }
    setSaving(false);
  };

  const updateLink = (idx: number, key: 'label' | 'url', value: string) => {
    setForm(prev => {
      const next = [...prev.links];
      next[idx] = { ...next[idx], [key]: value };
      return { ...prev, links: next };
    });
  };

  const removeLink = (idx: number) => {
    setForm(prev => ({ ...prev, links: prev.links.filter((_, i) => i !== idx) }));
  };

  const addLink = () => {
    setForm(prev => ({ ...prev, links: [...prev.links, { label: '', url: '' }] }));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bold text-lg">頁尾管理</h2>
          <p className="text-sm text-gray-400">修改網站底部的品牌名稱、版權宣告與社群連結</p>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-slate-700 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> 重新載入
        </button>
      </div>

      {/* Basic Fields */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h3 className="font-bold text-sm">基本資訊</h3>

        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">品牌名稱</label>
          <input value={form.brandName} onChange={e => setForm(p => ({ ...p, brandName: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-400 bg-white" />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">
            版權宣告 <span className="text-gray-400 font-normal">（{'{year}'} 會自動替換為當前年份）</span>
          </label>
          <input value={form.copyright} onChange={e => setForm(p => ({ ...p, copyright: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-400 bg-white" />
        </div>
      </div>

      {/* Links */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm">頁尾連結</h3>
          <button onClick={addLink} className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium">
            <Plus className="w-3.5 h-3.5" /> 新增連結
          </button>
        </div>

        {form.links.map((link, idx) => (
          <div key={idx} className="bg-slate-50 rounded-xl p-4 relative border border-gray-100">
            <button onClick={() => removeLink(idx)}
              className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">顯示文字</label>
                <input value={link.label} onChange={e => updateLink(idx, 'label', e.target.value)}
                  placeholder="例如：Twitter"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-slate-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">連結網址</label>
                <input value={link.url} onChange={e => updateLink(idx, 'url', e.target.value)}
                  placeholder="https://… 或 /contact 或 mailto:…"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-slate-400" />
              </div>
            </div>
          </div>
        ))}

        {form.links.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">尚未新增任何連結</p>
        )}
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1E3A8A] transition-colors disabled:opacity-60">
          <Save className="w-4 h-4" /> {saving ? '儲存中…' : '儲存頁尾'}
        </button>
      </div>
    </motion.div>
  );
}
