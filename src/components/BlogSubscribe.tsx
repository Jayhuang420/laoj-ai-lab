import React, { useState } from 'react';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';

interface BlogSubscribeProps {
  /** 'inline' for blog list page, 'card' for blog post end */
  variant?: 'inline' | 'card';
}

export default function BlogSubscribe({ variant = 'card' }: BlogSubscribeProps) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: '部落格訂閱' }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setEmail('');
      } else {
        setError(data.error || '訂閱失敗，請稍後再試。');
      }
    } catch {
      setError('網路錯誤，請稍後再試。');
    }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className={`rounded-2xl border text-center ${
        variant === 'inline'
          ? 'bg-green-50 border-green-100 p-8'
          : 'bg-green-50 border-green-100 p-10'
      }`}>
        <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
        <p className="font-bold text-slate-900 text-lg mb-1">訂閱成功！</p>
        <p className="text-sm text-gray-500">有新文章時我們會第一時間通知你。</p>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-[#1E3A8A] rounded-2xl p-8 md:p-10 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 text-blue-200 text-xs font-semibold tracking-wider uppercase px-4 py-1.5 rounded-full mb-4">
          <Mail className="w-3.5 h-3.5" /> 免費訂閱
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">不錯過任何新文章</h3>
        <p className="text-blue-200 text-sm mb-6 max-w-md mx-auto">
          訂閱老 J 的實戰筆記，新文章上線時第一時間收到通知。
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="輸入你的 Email"
            required
            className="flex-1 px-5 py-3.5 rounded-full text-sm bg-white/10 border border-white/20 text-white placeholder:text-blue-200/60 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-colors"
          />
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3.5 bg-white text-[#1E3A8A] font-bold text-sm rounded-full hover:bg-blue-50 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {submitting ? '訂閱中…' : <>免費訂閱 <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
        {error && <p className="text-red-300 text-xs mt-3">{error}</p>}
        <p className="text-blue-300/50 text-xs mt-4">完全免費，隨時可取消。不會寄送垃圾信。</p>
      </div>
    );
  }

  // variant === 'card' (for blog post end)
  return (
    <div className="bg-gradient-to-br from-slate-900 to-[#1E3A8A] rounded-2xl p-8 md:p-10 mt-12">
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-white/10 text-blue-200 text-xs font-semibold tracking-wider uppercase px-4 py-1.5 rounded-full mb-3">
            <Mail className="w-3.5 h-3.5" /> 免費訂閱
          </div>
          <h3 className="text-xl font-bold text-white mb-2">喜歡這篇文章嗎？</h3>
          <p className="text-blue-200 text-sm">訂閱老 J 的實戰筆記，新文章上線時第一時間收到通知。</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="輸入你的 Email"
            required
            className="px-5 py-3.5 rounded-full text-sm bg-white/10 border border-white/20 text-white placeholder:text-blue-200/60 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-colors sm:w-56"
          />
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3.5 bg-white text-[#1E3A8A] font-bold text-sm rounded-full hover:bg-blue-50 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {submitting ? '訂閱中…' : <>免費訂閱 <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
      </div>
      {error && <p className="text-red-300 text-xs mt-3 text-center md:text-right">{error}</p>}
      <p className="text-blue-300/50 text-xs mt-4 text-center md:text-right">完全免費，隨時可取消。不會寄送垃圾信。</p>
    </div>
  );
}
