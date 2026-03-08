import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart3, Users, Wrench, Home, FileText, Settings, LogOut, Lock } from 'lucide-react';
import { useAdminApi } from './useAdminApi';
import { useToast } from '../../context/ToastContext';
import SEO from '../../components/SEO';
import OverviewTab from './OverviewTab';
import SubscribersTab from './SubscribersTab';
import ToolsTab from './ToolsTab';
import HomeContentTab from './HomeContentTab';
import AboutContentTab from './AboutContentTab';
import AccountTab from './AccountTab';

const tabs = [
  { id: 'overview', label: '總覽', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'subscribers', label: '訂閱者', icon: <Users className="w-4 h-4" /> },
  { id: 'tools', label: '工具管理', icon: <Wrench className="w-4 h-4" /> },
  { id: 'homeContent', label: '首頁管理', icon: <Home className="w-4 h-4" /> },
  { id: 'aboutContent', label: '關於頁管理', icon: <FileText className="w-4 h-4" /> },
  { id: 'account', label: '帳號設定', icon: <Settings className="w-4 h-4" /> },
];

/* ── Login Gate ─────────────────────────────────────────────────────────────── */
function LoginForm({ onLogin }: { onLogin: (u: string, p: string) => Promise<void> }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    // Read from FormData to handle browser autofill (autofill doesn't trigger onChange)
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const u = (formData.get('username') as string) || username;
    const p = (formData.get('password') as string) || password;
    if (!u.trim() || !p.trim()) { setError('請輸入帳號與密碼'); setLoading(false); return; }
    try { await onLogin(u, p); }
    catch (err: any) { setError(err.message || '登入失敗'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
        <div className="flex items-center justify-center w-14 h-14 bg-slate-900 rounded-2xl mx-auto mb-6">
          <Lock className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-center mb-1">後台管理</h1>
        <p className="text-sm text-gray-400 text-center mb-8">請輸入帳號與密碼登入</p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">帳號</label>
            <input name="username" value={username} onChange={e => setUsername(e.target.value)} placeholder="請輸入帳號"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-400 bg-white" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">密碼</label>
            <input name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="請輸入密碼"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-400 bg-white" />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-medium text-sm hover:bg-[#1E3A8A] transition-colors disabled:opacity-60">
            {loading ? '登入中…' : '登入'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

/* ── Admin Shell ────────────────────────────────────────────────────────────── */
export default function AdminPage() {
  const { token, login, logout, api } = useAdminApi();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  if (!token) return <><SEO title="後台管理" path="/admin" noindex /><LoginForm onLogin={login} /></>;

  const handleLogout = () => { logout(); showToast('已登出', 'success'); };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">後台管理</h1>
            <p className="text-sm text-gray-400 mt-1">老 J AI 實驗室 管理面板</p>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-500 transition-colors">
            <LogOut className="w-4 h-4" /> 登出
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl border border-gray-100 p-1.5 mb-8 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-gray-500 hover:text-slate-900 hover:bg-gray-50'
              }`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <div key={activeTab}>
            {activeTab === 'overview' && <OverviewTab api={api} />}
            {activeTab === 'subscribers' && <SubscribersTab api={api} />}
            {activeTab === 'tools' && <ToolsTab api={api} />}
            {activeTab === 'homeContent' && <HomeContentTab api={api} />}
            {activeTab === 'aboutContent' && <AboutContentTab api={api} />}
            {activeTab === 'account' && <AccountTab api={api} />}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
}
