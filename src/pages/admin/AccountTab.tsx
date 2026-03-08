import { useState } from 'react';
import { motion } from 'motion/react';
import { Save } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function AccountTab({ api }: { api: (path: string, opts?: RequestInit) => Promise<Response> }) {
  const { showToast } = useToast();
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!currentPassword) { showToast('請輸入目前密碼', 'error'); return; }
    if (newPassword && newPassword !== confirmPassword) { showToast('新密碼與確認密碼不一致', 'error'); return; }
    if (newPassword && newPassword.length < 6) { showToast('新密碼至少 6 個字元', 'error'); return; }

    setSaving(true);
    try {
      const res = await api('/api/admin/account', {
        method: 'PUT',
        body: JSON.stringify({
          username: username || undefined,
          currentPassword,
          newPassword: newPassword || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('帳號設定已更新', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else showToast(data.error || '更新失敗', 'error');
    } catch { showToast('網路錯誤', 'error'); }
    finally { setSaving(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="max-w-lg">
      <h2 className="font-bold text-lg mb-1">帳號設定</h2>
      <p className="text-sm text-gray-400 mb-8">修改管理員帳號名稱或密碼</p>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">新帳號名稱（留空則不更改）</label>
          <input value={username} onChange={e => setUsername(e.target.value)} placeholder="admin"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-400 bg-white" />
        </div>

        <hr className="border-gray-100" />

        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">目前密碼 *</label>
          <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-400 bg-white" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">新密碼（留空則不更改）</label>
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-400 bg-white" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">確認新密碼</label>
          <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-400 bg-white" />
        </div>

        <div className="flex justify-end pt-2">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#1E3A8A] transition-colors disabled:opacity-60">
            <Save className="w-4 h-4" /> {saving ? '儲存中…' : '儲存變更'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
