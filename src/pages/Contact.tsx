import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send, CheckCircle2, ArrowRight, Briefcase, Mail, User, Building, MessageSquare } from 'lucide-react';
import SEO from '../components/SEO';

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.5 },
};

const SERVICE_OPTIONS = [
  'AI 工作流自動化',
  '品牌數位轉型策略',
  '電商策略規劃',
  '一人公司 AI 化',
  'PLG 商業化路徑設計',
  '其他',
];

const BUDGET_OPTIONS = [
  '5 萬以下',
  '5-10 萬',
  '10-30 萬',
  '30-50 萬',
  '50 萬以上',
  '再討論',
];

const JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: '合作洽談 — 老J AI 實驗室',
    description: '與老 J 預約免費諮詢，討論 AI 工作流自動化、品牌轉型、電商策略等合作方案。',
    url: 'https://www.oldjailab.com/contact',
    mainEntity: {
      '@type': 'Organization',
      name: '老J AI 實驗室',
      url: 'https://www.oldjailab.com',
      email: 'jshao0420@gmail.com',
      description: '專為一人公司設計的 AI 變現實戰顧問。',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '首頁', item: 'https://www.oldjailab.com/' },
      { '@type': 'ListItem', position: 2, name: '合作洽談', item: 'https://www.oldjailab.com/contact' },
    ],
  },
];

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    service_type: '',
    budget: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('請填寫姓名、Email 與訊息。');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '提交失敗，請稍後再試。');
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || '提交失敗，請稍後再試。');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        title="合作洽談"
        description="與老 J 預約免費諮詢，討論 AI 工作流自動化、品牌數位轉型、電商策略、一人公司 AI 化等合作方案。填寫表單，1-2 個工作天內回覆。"
        path="/contact"
        jsonLd={JSON_LD}
      />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="pt-16 pb-8 px-6 max-w-4xl mx-auto text-center">
        <motion.div {...fadeInUp}>
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold tracking-wide mb-6">
            免費諮詢
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            讓 AI 幫你的事業加速
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
            不管是自動化工作流、品牌數位轉型還是商業模式設計，老 J 都能幫你找到最適合的 AI 解法。填寫以下表單，我會在 1-2 個工作天內回覆你。
          </p>
        </motion.div>
      </section>

      {/* ── Form ──────────────────────────────────────────────────────── */}
      <section className="pb-24 px-6 max-w-3xl mx-auto">
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 px-8 rounded-3xl bg-white border border-gray-100"
          >
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold mb-3">諮詢已送出！</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              感謝你的信任。我們已收到你的需求，將在 1-2 個工作天內以 Email 回覆你。
              <br />同時也已寄送一封確認信到你的信箱。
            </p>
            <a
              href="/"
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-[#1E3A8A] transition-colors"
            >
              回到首頁 <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        ) : (
          <motion.form
            onSubmit={handleSubmit}
            {...fadeInUp}
            className="bg-white rounded-3xl border border-gray-100 p-8 md:p-12 shadow-sm"
          >
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* 姓名 */}
              <div>
                <label htmlFor="name" className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                  <User className="w-3.5 h-3.5 text-gray-400" /> 姓名 <span className="text-red-400">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="你的姓名"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 bg-white transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                  <Mail className="w-3.5 h-3.5 text-gray-400" /> Email <span className="text-red-400">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 bg-white transition-all"
                />
              </div>

              {/* 公司名稱 */}
              <div>
                <label htmlFor="company" className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                  <Building className="w-3.5 h-3.5 text-gray-400" /> 公司名稱
                </label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="你的公司或品牌名稱（選填）"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 bg-white transition-all"
                />
              </div>

              {/* 服務類型 */}
              <div>
                <label htmlFor="service_type" className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                  <Briefcase className="w-3.5 h-3.5 text-gray-400" /> 服務類型
                </label>
                <select
                  id="service_type"
                  name="service_type"
                  value={form.service_type}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 bg-white transition-all appearance-none"
                >
                  <option value="">請選擇服務類型</option>
                  {SERVICE_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 預算範圍 */}
            <div className="mb-6">
              <label htmlFor="budget" className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                <Briefcase className="w-3.5 h-3.5 text-gray-400" /> 預算範圍
              </label>
              <select
                id="budget"
                name="budget"
                value={form.budget}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 bg-white transition-all appearance-none"
              >
                <option value="">請選擇預算範圍（選填）</option>
                {BUDGET_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* 訊息 */}
            <div className="mb-8">
              <label htmlFor="message" className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                <MessageSquare className="w-3.5 h-3.5 text-gray-400" /> 想諮詢的內容 <span className="text-red-400">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                value={form.message}
                onChange={handleChange}
                placeholder="請描述你目前的痛點或需求，例如：目前想導入 AI 自動化客服，但不確定從哪裡開始⋯⋯"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 bg-white transition-all resize-none"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm mb-4 bg-red-50 px-4 py-2 rounded-xl">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-xl font-medium text-sm hover:bg-[#1E3A8A] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                '送出中…'
              ) : (
                <>
                  <Send className="w-4 h-4" /> 送出諮詢
                </>
              )}
            </button>

            <p className="text-xs text-gray-400 text-center mt-4">
              我們重視你的隱私，所有資料僅用於回覆你的諮詢需求。
            </p>
          </motion.form>
        )}
      </section>
    </>
  );
}
