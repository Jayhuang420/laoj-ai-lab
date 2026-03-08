import { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Save, Plus, Trash2, RefreshCw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const DEFAULTS = {
  hero: {
    title: '不談空泛理論，只教你打造高獲利 AI 事業。',
    subtitle: '專為「一人公司」設計的實戰指南。結合精實創業與 PLG 思維，將 AI 從生產力工具轉化為具備 PMF 的可規模化業務。',
    ctaText: '探索 AI 實戰工具',
  },
  howItWorks: {
    steps: [
      { icon: 'Target', title: '找到你的剛需痛點', description: '用精實創業思維，在開始前先驗證市場需求，避免打造沒人要的產品。' },
      { icon: 'Cpu', title: '搭建 AI 自動化工作流', description: '從內容產出、客服到數據分析，讓 AI 擔任你的「虛擬團隊」，大幅降低人力成本。' },
      { icon: 'TrendingUp', title: '快速迭代、放大獲利', description: '以 PLG 思維為核心，透過數據反饋持續優化，將成功的工作流複製並規模化。' },
    ],
  },
  leadMagnet: {
    title: '《2026 AI 變現全景地圖》',
    subtitle: '拆解從 0 到 1 的 AI 變現路徑，涵蓋必備工具清單、3 個立即可執行的自動化工作流，以及老 J 親測有效的選品策略。',
    buttonText: '立即發送給我',
  },
  stats: {
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

type SectionKey = keyof typeof DEFAULTS;

function SectionEditor({ title, sectionKey, data, onSave }: {
  title: string; sectionKey: SectionKey; data: any; onSave: (key: SectionKey, val: any) => void | Promise<void>;
}) {
  const [form, setForm] = useState(data);
  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  useEffect(() => { setForm(data); }, [data]);

  /* Simple fields (hero, leadMagnet, ctaBanner) */
  if (sectionKey === 'hero' || sectionKey === 'leadMagnet' || sectionKey === 'ctaBanner') {
    const fields = Object.keys(DEFAULTS[sectionKey]) as string[];
    const labels: Record<string, string> = {
      title: '標題', subtitle: '副標題', ctaText: '按鈕文字', buttonText: '按鈕文字',
    };
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h3 className="font-bold text-sm">{title}</h3>
        {fields.map(f => (
          <div key={f}>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">{labels[f] || f}</label>
            {f === 'subtitle' ? (
              <textarea value={form[f] || ''} onChange={e => set(f, e.target.value)} rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-400 bg-white resize-none" />
            ) : (
              <input value={form[f] || ''} onChange={e => set(f, e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-400 bg-white" />
            )}
          </div>
        ))}
        <div className="flex justify-end pt-2">
          <button onClick={() => onSave(sectionKey, form)}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm hover:bg-[#1E3A8A] transition-colors">
            <Save className="w-4 h-4" /> 儲存
          </button>
        </div>
      </div>
    );
  }

  /* Array fields (howItWorks.steps, stats.items) */
  const arrayKey = sectionKey === 'howItWorks' ? 'steps' : 'items';
  const items: any[] = form[arrayKey] || [];
  const updateItem = (idx: number, k: string, v: any) => {
    const next = [...items];
    next[idx] = { ...next[idx], [k]: v };
    setForm((p: any) => ({ ...p, [arrayKey]: next }));
  };
  const removeItem = (idx: number) => {
    setForm((p: any) => ({ ...p, [arrayKey]: items.filter((_: any, i: number) => i !== idx) }));
  };
  const addItem = () => {
    const template = sectionKey === 'howItWorks'
      ? { icon: 'Wrench', title: '', description: '' }
      : { number: 0, suffix: '', label: '', sub: '' };
    setForm((p: any) => ({ ...p, [arrayKey]: [...items, template] }));
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm">{title}</h3>
        <button onClick={addItem} className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium">
          <Plus className="w-3.5 h-3.5" /> 新增項目
        </button>
      </div>
      {items.map((item: any, idx: number) => (
        <div key={idx} className="bg-slate-50 rounded-xl p-4 space-y-3 relative border border-gray-100">
          <button onClick={() => removeItem(idx)} className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
          {sectionKey === 'howItWorks' ? (
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">圖示名稱</label>
                <input value={item.icon || ''} onChange={e => updateItem(idx, 'icon', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-slate-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">標題</label>
                <input value={item.title || ''} onChange={e => updateItem(idx, 'title', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-slate-400" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-500 mb-1 block">描述</label>
                <textarea value={item.description || ''} onChange={e => updateItem(idx, 'description', e.target.value)} rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white resize-none focus:outline-none focus:border-slate-400" />
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">數字</label>
                <input type="number" value={item.number ?? 0} onChange={e => updateItem(idx, 'number', Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-slate-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">後綴 (%, + 等)</label>
                <input value={item.suffix || ''} onChange={e => updateItem(idx, 'suffix', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-slate-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">標籤</label>
                <input value={item.label || ''} onChange={e => updateItem(idx, 'label', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-slate-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">副說明</label>
                <input value={item.sub || ''} onChange={e => updateItem(idx, 'sub', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-slate-400" />
              </div>
            </div>
          )}
        </div>
      ))}
      <div className="flex justify-end pt-2">
        <button onClick={() => onSave(sectionKey, form)}
          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm hover:bg-[#1E3A8A] transition-colors">
          <Save className="w-4 h-4" /> 儲存
        </button>
      </div>
    </div>
  );
}

export default function HomeContentTab({ api }: { api: (path: string, opts?: RequestInit) => Promise<Response> }) {
  const { showToast } = useToast();
  const [data, setData] = useState<Record<string, any>>({});

  const load = useCallback(async () => {
    const res = await api('/api/content/home');
    if (res.ok) setData(await res.json());
  }, [api]);

  useEffect(() => { load(); }, [load]);

  const saveSection = async (key: SectionKey, value: any) => {
    const res = await api(`/api/admin/content/home/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ content: value }),
    });
    if (res.ok) {
      setData(p => ({ ...p, [key]: value }));
      showToast('已儲存', 'success');
    } else showToast('儲存失敗', 'error');
  };

  const sections: { key: SectionKey; title: string }[] = [
    { key: 'hero', title: 'Hero 區塊（主視覺）' },
    { key: 'howItWorks', title: '三步驟區塊' },
    { key: 'leadMagnet', title: 'Lead Magnet（電子書下載）' },
    { key: 'stats', title: '數據統計區塊' },
    { key: 'ctaBanner', title: 'CTA Banner（行動呼籲）' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bold text-lg">首頁內容管理</h2>
          <p className="text-sm text-gray-400">修改首頁各區塊的文字與數據</p>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-slate-700 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> 重新載入
        </button>
      </div>
      {sections.map(({ key: k, title: t }) => (
        <SectionEditor key={k} title={t} sectionKey={k}
          data={data[k] || DEFAULTS[k]} onSave={saveSection} />
      ))}
    </motion.div>
  );
}
