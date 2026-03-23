import React, { useRef, useEffect, useState, useCallback } from 'react';
import { X, Download, Check, RefreshCw, Palette } from 'lucide-react';

const W = 1200, H = 630;

const CATEGORY_CONFIG: Record<string, { emoji: string; gradient: [string, string] }> = {
  '工具介紹': { emoji: '🔧', gradient: ['#1E3A8A', '#2563eb'] },
  '技術教學': { emoji: '💡', gradient: ['#0f172a', '#1e40af'] },
  'AI 應用':  { emoji: '🤖', gradient: ['#1e293b', '#1E3A8A'] },
  '創業心得': { emoji: '🚀', gradient: ['#1e3a5f', '#2563eb'] },
  '案例分析': { emoji: '📊', gradient: ['#1a2744', '#1E3A8A'] },
  '一般':     { emoji: '📝', gradient: ['#334155', '#1E3A8A'] },
};

const STYLE_PRESETS = [
  { name: '經典深藍', gradients: [['#1E3A8A', '#2563eb'], ['#0f172a', '#1e40af']] },
  { name: '暗夜黑金', gradients: [['#1a1a2e', '#16213e'], ['#0f0f23', '#1a1a2e']] },
  { name: '科技紫',   gradients: [['#2d1b69', '#5b21b6'], ['#1e1b4b', '#4338ca']] },
  { name: '深海綠',   gradients: [['#064e3b', '#059669'], ['#022c22', '#047857']] },
  { name: '暖橘紅',   gradients: [['#7c2d12', '#dc2626'], ['#451a03', '#ea580c']] },
];

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = [];
  const paragraphs = text.split('\n');
  for (const para of paragraphs) {
    const chars = [...para];
    let currentLine = '';
    for (const char of chars) {
      const testLine = currentLine + char;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
  }
  return lines;
}

function renderCover(
  canvas: HTMLCanvasElement,
  title: string,
  category: string,
  gradientOverride?: [string, string],
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = W;
  canvas.height = H;

  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG['一般'];
  const colors = gradientOverride || config.gradient;

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, colors[0]);
  grad.addColorStop(1, colors[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Decorative circle (top right)
  ctx.beginPath();
  ctx.arc(W - 120, -60, 280, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.fill();

  // Decorative circle (bottom left)
  ctx.beginPath();
  ctx.arc(80, H + 40, 200, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.fill();

  // Diagonal accent line
  ctx.beginPath();
  ctx.moveTo(W - 400, 0);
  ctx.lineTo(W, 300);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Dot pattern
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 3; j++) {
      ctx.beginPath();
      ctx.arc(W - 180 + i * 24, 420 + j * 24, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fill();
    }
  }

  // Brand badge (top left)
  ctx.font = 'bold 16px "Microsoft JhengHei", "PingFang TC", "Noto Sans TC", sans-serif';
  const brandText = '老J AI 實驗室';
  const brandWidth = ctx.measureText(brandText).width + 32;

  drawRoundedRect(ctx, 60, 48, brandWidth, 36, 18);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.fillText(brandText, 76, 72);

  // Category badge (top left, below brand)
  ctx.font = '14px "Microsoft JhengHei", "PingFang TC", "Noto Sans TC", sans-serif';
  const catText = `${config.emoji}  ${category}`;
  const catWidth = ctx.measureText(catText).width + 28;

  drawRoundedRect(ctx, 60, 100, catWidth, 30, 15);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fillText(catText, 74, 120);

  // Main title — large, centered
  const titleFontSize = title.length > 40 ? 48 : title.length > 25 ? 54 : 60;
  ctx.font = `bold ${titleFontSize}px "Microsoft JhengHei", "PingFang TC", "Noto Sans TC", sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';

  const titleLines = wrapText(ctx, title, W - 160);
  const lineHeight = titleFontSize * 1.4;
  const totalTextHeight = titleLines.length * lineHeight;

  let startY = (H - totalTextHeight) / 2 + titleFontSize * 0.35;

  for (let i = 0; i < titleLines.length; i++) {
    const y = startY + i * lineHeight;
    // Shadow for readability
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillText(titleLines[i], W / 2 + 2, y + 3);
    // Main text
    ctx.fillStyle = '#ffffff';
    ctx.fillText(titleLines[i], W / 2, y);
  }
  ctx.textAlign = 'start';

  // Bottom accent bar (centered)
  const barW = 300;
  const barGrad = ctx.createLinearGradient((W - barW) / 2, 0, (W + barW) / 2, 0);
  barGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
  barGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
  barGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = barGrad;
  drawRoundedRect(ctx, (W - barW) / 2, H - 80, barW, 3, 1.5);
  ctx.fill();

  // Bottom URL (centered)
  ctx.font = '15px "Microsoft JhengHei", "PingFang TC", "Noto Sans TC", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.textAlign = 'center';
  ctx.fillText('oldjailab.com', W / 2, H - 48);
  ctx.textAlign = 'start';
}

interface CoverGeneratorProps {
  title: string;
  category: string;
  onUse: (blob: Blob) => void;
  onClose: () => void;
}

export default function CoverGenerator({ title, category, onUse, onClose }: CoverGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [editTitle, setEditTitle] = useState(title);
  const [styleIdx, setStyleIdx] = useState(-1); // -1 = auto from category
  const [applying, setApplying] = useState(false);

  const currentGradient = styleIdx >= 0
    ? STYLE_PRESETS[styleIdx].gradients[0] as [string, string]
    : undefined;

  const draw = useCallback(() => {
    if (!canvasRef.current) return;
    renderCover(canvasRef.current, editTitle || title || '文章標題', category, currentGradient);
  }, [editTitle, title, category, currentGradient]);

  useEffect(() => { draw(); }, [draw]);

  const handleUse = async () => {
    if (!canvasRef.current) return;
    setApplying(true);
    canvasRef.current.toBlob(blob => {
      if (blob) onUse(blob);
      setApplying(false);
    }, 'image/png');
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `cover-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-slate-900">品牌封面產生器</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Preview */}
          <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            <canvas
              ref={canvasRef}
              className="w-full"
              style={{ aspectRatio: '1200/630' }}
            />
          </div>

          {/* Title input */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">封面標題（可自訂換行）</label>
            <textarea
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              rows={2}
              placeholder="輸入封面上要顯示的標題文字，按 Enter 換行"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-400 resize-none"
            />
          </div>

          {/* Style presets */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" /> 配色風格
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStyleIdx(-1)}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                  styleIdx === -1
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                自動（依分類）
              </button>
              {STYLE_PRESETS.map((preset, i) => (
                <button
                  key={preset.name}
                  onClick={() => setStyleIdx(i)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors flex items-center gap-1.5 ${
                    styleIdx === i
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full inline-block"
                    style={{ background: `linear-gradient(135deg, ${preset.gradients[0][0]}, ${preset.gradients[0][1]})` }}
                  />
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Download className="w-4 h-4" /> 下載 PNG
          </button>
          <div className="flex gap-3">
            <button
              onClick={draw}
              className="flex items-center gap-2 text-sm border border-gray-200 rounded-xl px-4 py-2.5 hover:bg-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> 重新整理
            </button>
            <button
              onClick={handleUse}
              disabled={applying}
              className="flex items-center gap-2 text-sm bg-slate-900 text-white rounded-xl px-5 py-2.5 hover:bg-slate-800 transition-colors disabled:opacity-60"
            >
              <Check className="w-4 h-4" /> {applying ? '處理中…' : '使用此封面'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
