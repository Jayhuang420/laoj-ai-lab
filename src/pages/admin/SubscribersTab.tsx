import { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Trash2, RefreshCw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface Subscriber { id: number; email: string; created_at: string; source: string; }

export default function SubscribersTab({ api }: { api: (path: string, opts?: RequestInit) => Promise<Response> }) {
  const { showToast } = useToast();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);

  const load = useCallback(async () => {
    const res = await api('/api/admin/subscribers');
    if (res.ok) setSubscribers(await res.json());
  }, [api]);

  useEffect(() => { load(); }, [load]);

  const deleteSub = async (id: number) => {
    if (!confirm('確定要刪除這位訂閱者嗎？')) return;
    await api(`/api/admin/subscribers/${id}`, { method: 'DELETE' });
    setSubscribers(p => p.filter(s => s.id !== id));
    showToast('已刪除訂閱者', 'success');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm text-gray-500">共 <span className="font-bold text-slate-900">{subscribers.length}</span> 位訂閱者</p>
        <button onClick={load} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-slate-700 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> 重新整理
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-3.5 font-semibold text-gray-500 text-xs">Email</th>
              <th className="text-left px-6 py-3.5 font-semibold text-gray-500 text-xs">訂閱時間</th>
              <th className="text-left px-6 py-3.5 font-semibold text-gray-500 text-xs">來源</th>
              <th className="w-16" />
            </tr>
          </thead>
          <tbody>
            {subscribers.length === 0 && (
              <tr><td colSpan={4} className="text-center py-12 text-gray-400">尚無訂閱者</td></tr>
            )}
            {subscribers.map(s => (
              <tr key={s.id} className="border-b border-gray-50 hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-medium">{s.email}</td>
                <td className="px-6 py-4 text-gray-500 text-xs">{s.created_at}</td>
                <td className="px-6 py-4"><span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">{s.source}</span></td>
                <td className="px-4 py-4">
                  <button onClick={() => deleteSub(s.id)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
