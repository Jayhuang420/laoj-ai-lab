import React from 'react';
import { ExternalLink } from 'lucide-react';

/**
 * Ebook sales page banner for blog posts.
 * Links to https://ebook.oldjailab.com/
 * Design: black/gold theme matching the AI passive income ebook branding.
 */
export default function EbookBanner() {
  return (
    <a
      href="https://ebook.oldjailab.com/"
      target="_blank"
      rel="noopener noreferrer"
      className="group block mt-12 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-6 md:p-8">
        {/* Decorative gold accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600" />

        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Left: Text content */}
          <div className="flex-1 text-center md:text-left">
            {/* Badge */}
            <span className="inline-block text-xs font-bold tracking-wider text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 rounded-full px-3 py-1 mb-3">
              2026 普通人不露臉
            </span>

            <h3 className="text-xl md:text-2xl font-black text-white leading-tight mb-1">
              用 AI 打造
              <span className="text-yellow-400">你的第一個被動收入</span>
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              完整被動收入攻略 — 從 0 打造被動月收入 2 萬
            </p>

            {/* Feature tags */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
              <span className="text-xs font-semibold text-yellow-300 border border-yellow-400/40 rounded-full px-3 py-1">
                自動生成音樂
              </span>
              <span className="text-xs font-semibold text-yellow-300 border border-yellow-400/40 rounded-full px-3 py-1">
                上架 YT 頻道營利
              </span>
            </div>

            {/* CTA button */}
            <span className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-400 text-gray-900 font-bold text-sm px-6 py-2.5 rounded-full group-hover:from-yellow-400 group-hover:to-yellow-300 transition-all duration-300 shadow-md shadow-yellow-500/20">
              免費了解更多 <ExternalLink className="w-4 h-4" />
            </span>
          </div>

          {/* Right: Visual element (decorative icons mimicking the poster) */}
          <div className="hidden md:flex flex-col items-center justify-center w-48 h-32 relative">
            {/* Gold play button circle */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/30">
              <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            {/* Decorative sparkles */}
            <div className="absolute top-2 right-8 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-pulse delay-300" />
            <div className="absolute top-6 left-10 w-1 h-1 bg-yellow-200 rounded-full animate-pulse delay-700" />
            {/* Rising arrow */}
            <svg className="absolute -right-2 top-0 w-12 h-12 text-emerald-400 opacity-60" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2 20 L10 10 L14 14 L22 4 M16 4 L22 4 L22 10" />
            </svg>
          </div>
        </div>

        {/* Footer branding */}
        <div className="mt-4 pt-4 border-t border-gray-800 text-center md:text-left">
          <span className="text-xs text-gray-500">Written by </span>
          <span className="text-xs font-semibold text-gray-400">老 J AI 實驗室</span>
          <span className="text-xs text-gray-600 mx-2">|</span>
          <span className="text-xs text-gray-500">@chillnightAImusic</span>
        </div>
      </div>
    </a>
  );
}
