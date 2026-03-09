import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useScroll, useSpring } from 'motion/react';
import { Menu, X, ChevronUp } from 'lucide-react';

export default function Layout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showTop, setShowTop] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      setShowTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const navLinks = [
    { to: '/', label: '首頁' },
    { to: '/tools', label: 'AI 工具箱' },
    { to: '/blog', label: '部落格' },
    { to: '/about', label: '關於老 J' },
  ];

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-sans selection:bg-[#1E3A8A] selection:text-white flex flex-col">
      {/* Scroll Progress Bar */}
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 to-blue-500 origin-left z-[60]"
      />

      {/* Navigation */}
      <nav aria-label="主導覽列" className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#FDFCFB]/90 backdrop-blur-lg shadow-sm' : 'bg-[#FDFCFB]/80 backdrop-blur-md'
      } border-b border-gray-100`}>
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" aria-label="老J AI 實驗室 - 回到首頁" className="font-bold text-xl tracking-tight hover:text-[#1E3A8A] transition-colors">
            老 J AI 實驗室
          </Link>

          {/* Desktop Nav */}
          <div role="list" className="hidden md:flex gap-8 text-sm font-medium text-gray-600">
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to} className="relative py-1 group">
                <span className={`transition-colors ${isActive(to) ? 'text-[#1A1A1A]' : 'hover:text-[#1A1A1A]'}`}>
                  {label}
                </span>
                <motion.span
                  className="absolute bottom-0 left-0 h-0.5 bg-[#1E3A8A] rounded-full"
                  initial={false}
                  animate={{ width: isActive(to) ? '100%' : '0%' }}
                  transition={{ duration: 0.25 }}
                />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <a href="/#lead-magnet" className="hidden md:block bg-[#1A1A1A] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#1E3A8A] transition-colors">
              免費獲取地圖
            </a>
            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
              aria-label="選單"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="md:hidden overflow-hidden border-t border-gray-100 bg-[#FDFCFB]"
            >
              <div className="px-6 py-4 flex flex-col gap-2">
                {navLinks.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`py-3 px-4 rounded-xl font-medium text-sm transition-colors ${
                      isActive(to)
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {label}
                  </Link>
                ))}
                <a
                  href="/#lead-magnet"
                  className="mt-2 py-3 px-4 rounded-xl bg-[#1E3A8A] text-white text-sm font-medium text-center"
                >
                  免費獲取地圖
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="flex-1 pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 max-w-6xl mx-auto w-full border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 mt-auto">
        <div className="font-bold tracking-tight">老 J AI 實驗室</div>
        <p className="text-sm text-gray-500">© {new Date().getFullYear()} Old J AI Lab. All rights reserved.</p>
        <nav aria-label="社群連結" className="flex gap-6 text-sm font-medium text-gray-600">
          <a href="https://twitter.com/laojailab" target="_blank" rel="noopener noreferrer" aria-label="Twitter（在新視窗開啟）" className="hover:text-[#1A1A1A] transition-colors">Twitter</a>
          <a href="https://youtube.com/@laojailab" target="_blank" rel="noopener noreferrer" aria-label="YouTube（在新視窗開啟）" className="hover:text-[#1A1A1A] transition-colors">YouTube</a>
          <a href="mailto:contact@laojailab.com" aria-label="寄送 Email 聯繫" className="hover:text-[#1A1A1A] transition-colors">Email</a>
        </nav>
      </footer>

      {/* Scroll To Top */}
      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 left-6 z-50 w-11 h-11 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#1E3A8A] transition-colors"
            aria-label="回到頂部"
          >
            <ChevronUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
