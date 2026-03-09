import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, Trash2, ExternalLink } from 'lucide-react';

interface Inquiry {
  id: number;
  name: string;
  email: string;
  company: string;
  service_type: string;
  budget: string;
  message: string;
  status: 'new' | 'contacted' | 'closed';
  notion_page_id: string;
  created_at: string;
  updated_at: string;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  new: { label: '新諮詢', color: 'bg-blue-100 text-blue-700' },
  contacted: { label: '已聯繫', color: 'bg-amber-100 text-amber-700' },
  closed: { label: '已結案', color: 'bg-gray-100 text-gray-500' },
};

export default function InquiriesTab({ api }: { api: (url: string, opts?: RequestInit) => Promise<any> }) {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterService, setFilterService] = useState<string>('all');

  const load = async () => {
    setLoading(true);
    try {
      const data = await api('/api/admin/inquiries');
      setInquiries(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await api(`/api/admin/inquiries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: status as Inquiry['status'] } : i));
    } catch { /* ignore */ }
  };

  const deleteInquiry = async (id: number) => {
    if (!confirm('確定要刪除這筆諮詢嗎？')) return;
    try {
      await api(`/api/admin/inquiries/${id}`, { method: 'DELETE' });
      setInquiries(prev => prev.filter(i => i.id !== id));
    } catch { /* ignore */ }
  };

  const filtered = inquiries.filter(i => {
    if (filterStatus !== 'all' && i.status !== filterStatus) return false;
    if (filterService !== 'all' && i.service_type !== filterService) return false;
    return true;
  });

  const serviceTypes = [...new Set(inquiries.map(i => i.service_type).filter(Boolean))];

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-400 text-sm">載入中…</div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm bg-white focus:outline-none focus:border-slate-400"
        >
          <option value="all">全部狀態</option>
          <option value="new">新諮詢</option>
          <option value="contacted">已聯繫</option>
          <option value="closed">已結案</option>
        </select>
        <select
          value={filterService}
          onChange={e => setFilterService(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm bg-white focus:outline-none focus:border-slate-400"
        >
          <option value="all">全部服務類型</option>
          {serviceTypes.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <div className="ml-auto text-sm text-gray-400 self-center">
          共 {filtered.length} 筆
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-sm">
          {inquiries.length === 0 ? '尚無諮詢紀錄' : '沒有符合篩選條件的結果'}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(inquiry => {
            const isExpanded = expandedId === inquiry.id;
            const status = STATUS_MAP[inquiry.status] || STATUS_MAP.new;

            return (
              <div key={inquiry.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {/* Row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : inquiry.id)}
                  className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${status.color}`}>
                    {status.label}
                  </span>
                  <span className="font-medium text-sm flex-1 truncate">{inquiry.name}</span>
                  <span className="text-xs text-gray-400 hidden sm:block">{inquiry.email}</span>
                  <span className="text-xs text-gray-400 hidden md:block">{inquiry.service_type || '—'}</span>
                  <span className="text-xs text-gray-400 hidden lg:block">
                    {new Date(inquiry.created_at).toLocaleDateString('zh-TW')}
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>

                {/* Expanded Detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 pt-2 border-t border-gray-50 space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400 text-xs">Email</span>
                            <p className="font-medium">{inquiry.email}</p>
                          </div>
                          <div>
                            <span className="text-gray-400 text-xs">公司</span>
                            <p className="font-medium">{inquiry.company || '未填寫'}</p>
                          </div>
                          <div>
                            <span className="text-gray-400 text-xs">服務類型</span>
                            <p className="font-medium">{inquiry.service_type || '未選擇'}</p>
                          </div>
                          <div>
                            <span className="text-gray-400 text-xs">預算</span>
                            <p className="font-medium">{inquiry.budget || '未選擇'}</p>
                          </div>
                          <div>
                            <span className="text-gray-400 text-xs">提交時間</span>
                            <p className="font-medium">{new Date(inquiry.created_at).toLocaleString('zh-TW')}</p>
                          </div>
                          {inquiry.notion_page_id && (
                            <div>
                              <span className="text-gray-400 text-xs">Notion</span>
                              <a
                                href={`https://notion.so/${inquiry.notion_page_id.replace(/-/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-blue-600 text-sm hover:underline"
                              >
                                查看 <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </div>

                        <div>
                          <span className="text-gray-400 text-xs">訊息內容</span>
                          <p className="mt-1 text-sm bg-gray-50 rounded-xl p-4 whitespace-pre-wrap leading-relaxed">
                            {inquiry.message}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 pt-2">
                          <select
                            value={inquiry.status}
                            onChange={e => updateStatus(inquiry.id, e.target.value)}
                            className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-slate-400"
                          >
                            <option value="new">新諮詢</option>
                            <option value="contacted">已聯繫</option>
                            <option value="closed">已結案</option>
                          </select>
                          <button
                            onClick={() => deleteInquiry(inquiry.id)}
                            className="ml-auto flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> 刪除
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
