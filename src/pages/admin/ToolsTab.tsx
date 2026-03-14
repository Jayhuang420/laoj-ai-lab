import { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Trash2, Plus, Pencil, ToggleLeft, ToggleRight } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface Tool { id: number; title: string; description: string; url: string; icon_name: string; category: string; is_active: number; sort_order: number; }

const CATEGORIES = ['內容創作', '數據分析', '命理占卜', '商業應用', '生活效率', '學習資源', '其他'];
const ICONS = ['Music', 'Dices', 'Hash', 'Sparkles', 'Utensils', 'BookOpen', 'Lightbulb', 'Wrench'];

const emptyTool = { title: '', description: '', url: '', icon_name: 'Wrench', category: '其他', is_active: 1, sort_order: 99 };

function ToolForm({ initial, onSave, onCancel }: { initial?: Partial<Tool>; onSave: (data: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState({ ...emptyTool, ...initial });
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="bg-slate-50 rounded-2xl border border-gray-200 p-6 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">工具名稱 *</label>
          <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="工具名稱"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-400 bg-white" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">連結 URL</label>
          <input value={form.url} onChange={e => set('url', e.target.value)} placeholder="https://..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-400 bg-white" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">分類</label>
          <select value={form.category} onChange={e => set('category', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-400 bg-white">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">圖示</label>
          <select value={form.icon_name} onChange={e => set('icon_name', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-400 bg-white">
            {ICONS.map(ic => <option key={ic}>{ic}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-gray-500 mb-1 block">描述</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="工具說明…"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-400 bg-white resize-none" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">排序</label>
          <input type="number" value={form.sort_order} onChange={e => set('sort_order', Number(e.target.value))}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-400 bg-white" />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button onClick={onCancel} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm hover:bg-gray-50 transition-colors">取消</button>
        <button onClick={() => onSave(form)}
          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm hover:bg-[#1E3A8A] transition-colors">
          {initial?.id ? '儲存變更' : '新增工具'}
        </button>
      </div>
    </div>
  );
}

export default function ToolsTab({ api }: { api: (path: string, opts?: RequestInit) => Promise<Response> }) {
  const { showToast } = useToast();
  const [tools, setTools] = useState<Tool[]>([]);
  const [editingTool, setEditingTool] = useState<Tool | null | 'new'>(null);

  const load = useCallback(async () => {
    const res = await api('/api/admin/tools');
    if (res.ok) setTools(await res.json());
  }, [api]);

  useEffect(() => { load(); }, [load]);

  const toggleTool = async (tool: Tool) => {
    const res = await api(`/api/admin/tools/${tool.id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...tool, is_active: tool.is_active ? 0 : 1 }),
    });
    if (res.ok) { const updated = await res.json(); setTools(p => p.map(t => t.id === updated.id ? updated : t)); }
  };

  const deleteTool = async (id: number) => {
    if (!confirm('確定要刪除此工具嗎？此操作無法復原。')) return;
    await api(`/api/admin/tools/${id}`, { method: 'DELETE' });
    setTools(p => p.filter(t => t.id !== id));
    showToast('工具已刪除', 'success');
  };

  const saveTool = async (data: any) => {
    const isEdit = typeof editingTool === 'object' && editingTool !== null && editingTool.id;
    const res = await api(
      isEdit ? `/api/admin/tools/${(editingTool as Tool).id}` : '/api/admin/tools',
      { method: isEdit ? 'PUT' : 'POST', body: JSON.stringify(data) },
    );
    if (res.ok) {
      const saved = await res.json();
      if (isEdit) setTools(p => p.map(t => t.id === saved.id ? saved : t));
      else setTools(p => [...p, saved]);
      setEditingTool(null);
      showToast(isEdit ? '工具已更新' : '工具已新增', 'success');
    } else showToast('儲存失敗', 'error');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm text-gray-500">共 <span className="font-bold text-slate-900">{tools.length}</span> 個工具</p>
        <button onClick={() => setEditingTool('new')}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1E3A8A] transition-colors">
          <Plus className="w-4 h-4" /> 新增工具
        </button>
      </div>

      {editingTool === 'new' && (
        <ToolForm onSave={saveTool} onCancel={() => setEditingTool(null)} />
      )}

      <div className="space-y-3">
        {tools.map(tool => (
          <div key={tool.id}>
            <div className={`bg-white rounded-2xl border p-5 flex items-start gap-4 transition-all ${
              editingTool && (editingTool as Tool).id === tool.id ? 'border-slate-300' : 'border-gray-100 hover:border-gray-200'}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-bold ${tool.is_active ? 'text-slate-900' : 'text-gray-400'}`}>{tool.title}</span>
                  {!tool.is_active && <span className="text-xs bg-red-50 text-red-400 px-2 py-0.5 rounded-full border border-red-100">已停用</span>}
                </div>
                <p className="text-xs text-gray-400 truncate">{tool.url}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{tool.category}</span>
                  <span className="text-xs text-gray-400">排序: {tool.sort_order}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggleTool(tool)} title={tool.is_active ? '停用' : '啟用'}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-slate-700">
                  {tool.is_active ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
                <button onClick={() => setEditingTool(editingTool && (editingTool as Tool).id === tool.id ? null : tool)}
                  title="編輯"
                  className={`p-2 rounded-xl transition-colors ${
                    editingTool && (editingTool as Tool).id === tool.id
                      ? 'bg-slate-900 text-white hover:bg-slate-800'
                      : 'hover:bg-gray-100 text-gray-400 hover:text-slate-700'
                  }`}>
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => deleteTool(tool.id)}
                  className="p-2 rounded-xl hover:bg-red-50 transition-colors text-gray-300 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            {editingTool && (editingTool as Tool).id === tool.id && (
              <div className="mt-2">
                <ToolForm initial={tool} onSave={saveTool} onCancel={() => setEditingTool(null)} />
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
