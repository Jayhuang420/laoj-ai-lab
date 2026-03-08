import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Save, Plus, Trash2, RefreshCw, Upload, ImageIcon } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const DEFAULTS = {
  intro: {
    name: '老 J',
    role: 'AI 實驗室創辦人',
    bio: [
      '我深知在資源有限的情況下，如何將未經證實的點子轉化為具備「產品市場媒合度（PMF）」的可規模化業務。',
      '老 J AI 實驗室的成立，是為了分享那些我親身實踐過、真正能降低成本並帶來收益的 AI 工作流。我們拒絕虛榮功能，只專注於解決剛需。',
    ],
  },
  skills: {
    items: [
      { name: '精實創業 / MVP 思維', percentage: 95 },
      { name: 'AI 工作流自動化', percentage: 90 },
      { name: '零售 & 電商品牌策略', percentage: 88 },
      { name: 'PLG 商業化路徑設計', percentage: 82 },
      { name: 'Prompt Engineering', percentage: 85 },
    ],
  },
  principles: {
    items: [
      { title: '問題導向', description: '拒絕虛榮功能。在回答任何建議前，必須先驗證這是否解決了客戶的「剛需」。' },
      { title: '具體可執行', description: '所有的建議必須包含具體的行動步驟、推薦的 AI 協作工具或自動化工作流。' },
      { title: '0 到 1 的速度感', description: '優先考慮 MVP 路徑，強調透過快速迭代獲取市場反饋，而非追求一次性的完美。' },
    ],
  },
  timeline: {
    items: [
      { year: '2011–2018', title: '零售業高階管理', description: '加入連鎖零售集團，從門市主管一路晉升至區域總監，操盤 150+ 門市、帶領 500+ 人團隊，年營收逾百億。' },
      { year: '2018–2022', title: '電商暨品牌數位轉型', description: '主導集團電商業務從零打造，整合 O2O 策略，打通線下數據鏈路，帶動整體業績年成長 40%+。' },
      { year: '2022–2024', title: '投入 AI 工具開發', description: '開始研究 GPT、Claude 等大型語言模型的商業應用，建立多個自動化工作流，驗證 AI 變現可行性。' },
      { year: '2024–Now', title: '老 J AI 實驗室創立', description: '整合 12 年管理實戰與 AI 開發經驗，打造「老 J AI 實驗室」，聚焦一人公司 AI 化與 PLG 商業化路徑。' },
    ],
  },
};

type SectionKey = keyof typeof DEFAULTS;

function IntroEditor({ data, onSave, onImageUploaded }: { data: any; onSave: (v: any) => void; onImageUploaded: () => void }) {
  const [form, setForm] = useState(data);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { setForm(data); }, [data]);
  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const token = sessionStorage.getItem('laoj_admin_token');
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch('/api/admin/upload/profile-image', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd,
      });
      if (res.ok) {
        const result = await res.json();
        setForm((p: any) => ({ ...p, profileImage: result.imageUrl }));
        onImageUploaded();
      } else {
        const err = await res.json().catch(() => ({ error: '上傳失敗' }));
        alert(err.error || '上傳失敗');
      }
    } catch {
      alert('上傳失敗，請檢查網路連線。');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
      <h3 className="font-bold text-sm">個人簡介</h3>

      {/* Profile Image Upload */}
      <div>
        <label className="text-xs font-semibold text-gray-500 mb-2 block">個人照片</label>
        <div className="flex items-center gap-5">
          <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center bg-slate-50 shrink-0">
            {form.profileImage ? (
              <img src={form.profileImage} alt="個人照片" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-8 h-8 text-gray-300" />
            )}
          </div>
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
                e.target.value = '';
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {uploading ? '上傳中...' : form.profileImage ? '更換照片' : '選擇照片'}
            </button>
            <p className="text-xs text-gray-400">支援 JPG, PNG, WebP, GIF（最大 5MB）</p>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">名稱</label>
          <input value={form.name || ''} onChange={e => set('name', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-400 bg-white" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">角色 / 職稱</label>
          <input value={form.role || ''} onChange={e => set('role', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-400 bg-white" />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-500 mb-1 block">自我介紹（每行一段）</label>
        <textarea value={(form.bio || []).join('\n')} rows={5}
          onChange={e => set('bio', e.target.value.split('\n'))}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-400 bg-white resize-none" />
      </div>
      <div className="flex justify-end pt-2">
        <button onClick={() => onSave(form)}
          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm hover:bg-[#1E3A8A] transition-colors">
          <Save className="w-4 h-4" /> 儲存
        </button>
      </div>
    </div>
  );
}

function ArrayEditor({ title, sectionKey, data, fields, onSave }: {
  title: string; sectionKey: SectionKey; data: any;
  fields: { key: string; label: string; type?: string }[];
  onSave: (v: any) => void;
}) {
  const [items, setItems] = useState<any[]>(data?.items || []);
  useEffect(() => { setItems(data?.items || []); }, [data]);

  const updateItem = (idx: number, k: string, v: any) => {
    const next = [...items];
    next[idx] = { ...next[idx], [k]: v };
    setItems(next);
  };
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const addItem = () => {
    const template: any = {};
    fields.forEach(f => { template[f.key] = f.type === 'number' ? 0 : ''; });
    setItems([...items, template]);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm">{title}</h3>
        <button onClick={addItem} className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium">
          <Plus className="w-3.5 h-3.5" /> 新增項目
        </button>
      </div>
      {items.map((item, idx) => (
        <div key={idx} className="bg-slate-50 rounded-xl p-4 space-y-3 relative border border-gray-100">
          <button onClick={() => removeItem(idx)} className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
          <div className="grid sm:grid-cols-2 gap-3">
            {fields.map(f => (
              <div key={f.key} className={f.key === 'description' ? 'sm:col-span-2' : ''}>
                <label className="text-xs text-gray-500 mb-1 block">{f.label}</label>
                {f.key === 'description' ? (
                  <textarea value={item[f.key] || ''} onChange={e => updateItem(idx, f.key, e.target.value)} rows={2}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white resize-none focus:outline-none focus:border-slate-400" />
                ) : (
                  <input type={f.type || 'text'} value={item[f.key] ?? ''} onChange={e => updateItem(idx, f.key, f.type === 'number' ? Number(e.target.value) : e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-slate-400" />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="flex justify-end pt-2">
        <button onClick={() => onSave({ items })}
          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm hover:bg-[#1E3A8A] transition-colors">
          <Save className="w-4 h-4" /> 儲存
        </button>
      </div>
    </div>
  );
}

export default function AboutContentTab({ api }: { api: (path: string, opts?: RequestInit) => Promise<Response> }) {
  const { showToast } = useToast();
  const [data, setData] = useState<Record<string, any>>({});

  const load = useCallback(async () => {
    const res = await api('/api/content/about');
    if (res.ok) setData(await res.json());
  }, [api]);

  useEffect(() => { load(); }, [load]);

  const saveSection = async (key: SectionKey, value: any) => {
    const res = await api(`/api/admin/content/about/${key}`, {
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
          <h2 className="font-bold text-lg">關於頁內容管理</h2>
          <p className="text-sm text-gray-400">修改關於頁各區塊的內容</p>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-slate-700 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> 重新載入
        </button>
      </div>

      <IntroEditor data={data.intro || DEFAULTS.intro} onSave={v => saveSection('intro', v)} onImageUploaded={load} />

      <ArrayEditor title="專業技能" sectionKey="skills" data={data.skills || DEFAULTS.skills}
        fields={[{ key: 'name', label: '技能名稱' }, { key: 'percentage', label: '百分比', type: 'number' }]}
        onSave={v => saveSection('skills', v)} />

      <ArrayEditor title="核心理念" sectionKey="principles" data={data.principles || DEFAULTS.principles}
        fields={[{ key: 'title', label: '標題' }, { key: 'description', label: '描述' }]}
        onSave={v => saveSection('principles', v)} />

      <ArrayEditor title="時間軸" sectionKey="timeline" data={data.timeline || DEFAULTS.timeline}
        fields={[{ key: 'year', label: '年份' }, { key: 'title', label: '標題' }, { key: 'description', label: '描述' }]}
        onSave={v => saveSection('timeline', v)} />
    </motion.div>
  );
}
