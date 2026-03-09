import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home, ArrowLeft } from 'lucide-react';
import SEO from '../components/SEO';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <SEO title="頁面不存在" path="/404" noindex />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg"
      >
        <h1 className="text-8xl font-bold text-slate-200 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">找不到此頁面</h2>
        <p className="text-gray-500 mb-8">
          您造訪的頁面可能已被移除、更名或暫時無法使用。
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-full font-medium hover:bg-[#1E3A8A] transition-colors"
          >
            <Home className="w-4 h-4" /> 回到首頁
          </Link>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 border border-slate-300 text-slate-900 px-6 py-3 rounded-full font-medium hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> 瀏覽部落格
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
