import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Users, Wrench, BarChart3, RefreshCw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface Stats {
  subscribers: number; tools: number; pageViews: number; clicks: number;
  recentViews: any[]; topTools: any[];
}

/** 將長 blog URL 簡化為可讀的短標題 */
function formatPagePath(raw: string): string {
  try {
    const decoded = decodeURIComponent(raw);
    // 如果是 blog 文章路徑，提取標題部分
    if (decoded.startsWith('/blog/') && decoded.length > 10) {
      const slug = decoded.replace('/blog/', '');
      // 把 slug 中的 - 換成空格，截取前 30 字
      const title = slug.replace(/-/g, ' ');
      return title.length > 35 ? `📝 ${title.slice(0, 35)}…` : `📝 ${title}`;
    }
    return decoded;
  } catch {
    return raw;
  }
}

function StatsCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number | string; color: string }) {
  return (
    <div className={`rounded-2xl border p-6 flex items-center gap-5 ${color}`}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/60 shrink-0">{icon}</div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm opacity-70">{label}</div>
      </div>
    </div>
  );
}

export default function OverviewTab({ api }: { api: (path: string, opts?: RequestInit) => Promise<Response> }) {
  const { showToast } = useToast();
  const [stats, setStats] = useState<Stats | null>(null);

  const load = useCallback(async () => {
    const res = await api('/api/admin/stats');
    if (res.ok) setStats(await res.json());
  }, [api]);

  useEffect(() => { load(); }, [load]);

  if (!stats) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-8">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={<Users className="w-6 h-6 text-blue-600" />} label="總訂閱人數" value={stats.subscribers} color="bg-blue-50 border-blue-100 text-blue-900" />
        <StatsCard icon={<Wrench className="w-6 h-6 text-emerald-600" />} label="上架工具數" value={stats.tools} color="bg-emerald-50 border-emerald-100 text-emerald-900" />
        <StatsCard icon={<BarChart3 className="w-6 h-6 text-violet-600" />} label="總頁面瀏覽" value={stats.pageViews} color="bg-violet-50 border-violet-100 text-violet-900" />
        <StatsCard icon={<BarChart3 className="w-6 h-6 text-amber-600" />} label="工具點擊數" value={stats.clicks} color="bg-amber-50 border-amber-100 text-amber-900" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-bold mb-4 text-sm">7日頁面瀏覽</h3>
          {stats.recentViews.length ? stats.recentViews.map((v: any, i: number) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-600 truncate max-w-[70%]" title={decodeURIComponent(v.page)}>{formatPagePath(v.page)}</span>
              <span className="text-sm font-bold">{v.count}</span>
            </div>
          )) : <p className="text-gray-400 text-sm">尚無數據</p>}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-bold mb-4 text-sm">熱門工具點擊</h3>
          {stats.topTools.length ? stats.topTools.map((t: any, i: number) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-600 truncate max-w-[70%]">{t.tool_title}</span>
              <span className="text-sm font-bold">{t.count}</span>
            </div>
          )) : <p className="text-gray-400 text-sm">尚無點擊數據</p>}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={() => { load(); showToast('數據已更新', 'success'); }}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-slate-900 transition-colors">
          <RefreshCw className="w-4 h-4" /> 重新整理
        </button>
      </div>
    </motion.div>
  );
}
