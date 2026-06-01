import { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Save, Plus, Trash2, RefreshCw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { DEFAULTS } from '../../content/homeDefaults';

type SectionKey = keyof typeof DEFAULTS;

/* 欄位中文標籤（找不到就用 key 本身） */
const LABELS: Record<string, string> = {
  label: '小標籤', sectionTitle: '區塊標題', sectionSubtitle: '區塊副標題', subtitle: '副標題',
  title: '標題', titleHighlight: '標題亮點字', badgeText: '標章文字', photoBadge: '照片標章（留空即不顯示）',
  trustBadges: '信任標章（逗號分隔）', ctaText: '主按鈕文字', ctaSecondary: '次按鈕文字',
  buttonText: '按鈕文字', linkText: '連結文字', boxTitle: '方塊標題', boxSubtitle: '方塊副標',
  privacyText: '隱私說明', painsTitle: '痛點欄標題', fitTitle: '適合欄標題', pains: '痛點清單', fits: '適合清單',
  features: '課程內容清單', bullets: '指南重點清單', items: '項目', steps: '步驟',
  priceLabel: '價格標籤', price: '價格', priceOriginal: '原價文字', priceNote: '價格備註', note: '備註',
  featuredId: '精選 YouTube 影片 ID', featuredTitle: '精選影片標題', highlight: '亮點字（如「免費」）',
  name: '名稱', tag: '標籤', desc: '描述', description: '描述', metric: '數據', metricLabel: '數據說明',
  url: '連結 URL', accent: '色系（violet / fuchsia）', avatar: '頭像路徑', handle: '帳號', niche: '利基', stat: '數據', result: '成果',
  img: '圖片路徑', amount: '金額', cover: '封面路徑', icon: '圖示名稱（Target/Cpu/TrendingUp）', id: 'YouTube 影片 ID',
  number: '數字', suffix: '後綴（%、天、萬+ 等）', sub: '副說明', q: '問題', a: '答案',
};
const LONG = new Set(['subtitle', 'sectionSubtitle', 'description', 'desc', 'result', 'a', 'note', 'title', 'privacyText', 'trustBadges']);
const labelOf = (k: string) => LABELS[k] || k;

/* 單一純量欄位（字串→input/textarea；數字→number） */
function ScalarField({ fieldKey, value, onChange }: { fieldKey: string; value: any; onChange: (v: any) => void }) {
  if (typeof value === 'number') {
    return <input type="number" value={value} onChange={e => onChange(Number(e.target.value))}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-slate-400" />;
  }
  return LONG.has(fieldKey)
    ? <textarea value={value || ''} onChange={e => onChange(e.target.value)} rows={2}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white resize-none focus:outline-none focus:border-slate-400" />
    : <input value={value || ''} onChange={e => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-slate-400" />;
}

/* 字串陣列編輯器（pains / fits / features / bullets） */
function StringListEditor({ label, list, onChange }: { label: string; list: string[]; onChange: (l: string[]) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-500">{label}（{list.length}）</label>
        <button type="button" onClick={() => onChange([...list, ''])} className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"><Plus className="w-3 h-3" />新增</button>
      </div>
      {list.map((v, i) => (
        <div key={i} className="flex gap-2 items-start">
          <textarea value={v} onChange={e => { const n = [...list]; n[i] = e.target.value; onChange(n); }} rows={1}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white resize-none focus:outline-none focus:border-slate-400" />
          <button type="button" onClick={() => onChange(list.filter((_, j) => j !== i))} className="text-gray-300 hover:text-red-500 transition-colors mt-2"><Trash2 className="w-4 h-4" /></button>
        </div>
      ))}
    </div>
  );
}

/* 物件陣列編輯器（items / steps，欄位由資料自動推斷） */
function ObjectListEditor({ label, list, onChange }: { label: string; list: any[]; onChange: (l: any[]) => void }) {
  const sample = list[0] || {};
  const addItem = () => {
    const tmpl: any = {};
    Object.keys(sample).forEach(k => { tmpl[k] = typeof sample[k] === 'number' ? 0 : ''; });
    onChange([...list, tmpl]);
  };
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-500">{label}（{list.length}）</label>
        <button type="button" onClick={addItem} className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"><Plus className="w-3.5 h-3.5" />新增項目</button>
      </div>
      {list.map((item, idx) => (
        <div key={idx} className="bg-slate-50 rounded-xl p-4 relative border border-gray-100">
          <button type="button" onClick={() => onChange(list.filter((_, j) => j !== idx))} className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
          <div className="grid sm:grid-cols-2 gap-3 pr-6">
            {Object.keys(item).map(k => (
              <div key={k} className={LONG.has(k) ? 'sm:col-span-2' : ''}>
                <label className="text-[11px] text-gray-500 mb-1 block">{labelOf(k)}</label>
                <ScalarField fieldKey={k} value={item[k]} onChange={v => { const n = [...list]; n[idx] = { ...n[idx], [k]: v }; onChange(n); }} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* 通用區塊編輯器：自動依資料結構渲染扁平欄位＋陣列 */
function GenericSectionEditor({ title, sectionKey, data, onSave }: {
  title: string; sectionKey: SectionKey; data: any; onSave: (k: SectionKey, v: any) => void | Promise<void>;
}) {
  const [form, setForm] = useState<any>(data);
  useEffect(() => { setForm(data); }, [data]);
  const setKey = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
      <h3 className="font-bold text-sm">{title}</h3>
      {Object.keys(form || {}).map(k => {
        const v = form[k];
        if (Array.isArray(v)) {
          return (v.length === 0 || typeof v[0] === 'string')
            ? <StringListEditor key={k} label={labelOf(k)} list={v} onChange={l => setKey(k, l)} />
            : <ObjectListEditor key={k} label={labelOf(k)} list={v} onChange={l => setKey(k, l)} />;
        }
        return (
          <div key={k}>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">{labelOf(k)}</label>
            <ScalarField fieldKey={k} value={v} onChange={val => setKey(k, val)} />
          </div>
        );
      })}
      <div className="flex justify-end pt-2">
        <button type="button" onClick={() => onSave(sectionKey, form)}
          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm hover:bg-[#1E3A8A] transition-colors">
          <Save className="w-4 h-4" /> 儲存
        </button>
      </div>
    </div>
  );
}

/* 區塊順序（對齊首頁實際排列） */
const SECTIONS: { key: SectionKey; title: string }[] = [
  { key: 'hero', title: 'Hero 主視覺' },
  { key: 'painPoints', title: '痛點 / 適合誰' },
  { key: 'works', title: '代表作品（MV 牆）' },
  { key: 'channels', title: '真實戰績頻道' },
  { key: 'students', title: '學員實證' },
  { key: 'howItWorks', title: '三步驟系統' },
  { key: 'revenueProof', title: '真實收益實證' },
  { key: 'course', title: '線上課程' },
  { key: 'guarantee', title: '安心保證 / 風險逆轉' },
  { key: 'leadMagnet', title: '免費指南領取' },
  { key: 'faq', title: '常見問題 FAQ' },
  { key: 'featuredTools', title: '免費工具箱' },
  { key: 'stats', title: '數據統計' },
  { key: 'ctaBanner', title: '底部 CTA Banner' },
  { key: 'stickyBar', title: '浮動 CTA 浮窗' },
];

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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bold text-lg">首頁內容管理</h2>
          <p className="text-sm text-gray-400">首頁每一個文字區塊都可在這裡修改（含痛點、保證、浮窗）</p>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-slate-700 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> 重新載入
        </button>
      </div>

      {SECTIONS.map(s => (
        <GenericSectionEditor key={s.key} title={s.title} sectionKey={s.key}
          data={{ ...(DEFAULTS[s.key] as any), ...(data[s.key] || {}) }} onSave={saveSection} />
      ))}
    </motion.div>
  );
}
