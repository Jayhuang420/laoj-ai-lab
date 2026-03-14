import React, { useCallback, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Youtube from '@tiptap/extension-youtube';
import VideoNode from './VideoNode';
import EmbedNode from './EmbedNode';
import {
  Bold, Italic, Strikethrough, Heading2, Heading3,
  List, ListOrdered, Quote, Code2, Minus,
  Link2, ImagePlus, Undo2, Redo2, Upload, Globe,
  X, Video, Code,
} from 'lucide-react';

/* ── Types ─────────────────────────────────────────────────────────────────── */
interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

/* ── Toolbar Button ────────────────────────────────────────────────────────── */
function TBtn({
  onClick, isActive = false, disabled = false, icon: Icon, title,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  icon: React.ElementType;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
        isActive
          ? 'bg-slate-200 text-slate-900'
          : 'text-gray-400 hover:text-slate-700 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

/* ── Separator ─────────────────────────────────────────────────────────────── */
function Sep() {
  return <div className="w-px h-5 bg-gray-200 mx-0.5" />;
}

/* ── Main Component ────────────────────────────────────────────────────────── */
export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const [showImageModal, setShowImageModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: { class: 'rounded-xl my-4 max-w-full' },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
      }),
      Youtube.configure({
        inline: false,
        ccLanguage: 'zh-TW',
      }),
      VideoNode.configure({
        HTMLAttributes: { class: 'blog-video' },
      }),
      EmbedNode,
    ],
    content,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'ProseMirror outline-none min-h-[400px] px-5 py-4 text-sm',
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      {/* ── Toolbar ────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-gray-100 bg-gray-50/60">
        {/* Text formatting */}
        <TBtn onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')} icon={Bold} title="粗體" />
        <TBtn onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')} icon={Italic} title="斜體" />
        <TBtn onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')} icon={Strikethrough} title="刪除線" />

        <Sep />

        {/* Headings */}
        <TBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })} icon={Heading2} title="標題 H2" />
        <TBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })} icon={Heading3} title="標題 H3" />

        <Sep />

        {/* Lists & Quote */}
        <TBtn onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')} icon={List} title="無序清單" />
        <TBtn onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')} icon={ListOrdered} title="有序清單" />
        <TBtn onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')} icon={Quote} title="引言" />

        <Sep />

        {/* Code & HR */}
        <TBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')} icon={Code2} title="程式碼區塊" />
        <TBtn onClick={() => editor.chain().focus().setHorizontalRule().run()}
          icon={Minus} title="分隔線" />

        <Sep />

        {/* Link */}
        <TBtn onClick={() => setShowLinkModal(true)}
          isActive={editor.isActive('link')} icon={Link2} title="連結" />

        {/* Image */}
        <TBtn onClick={() => setShowImageModal(true)}
          icon={ImagePlus} title="插入圖片" />

        {/* Video */}
        <TBtn onClick={() => setShowVideoModal(true)}
          icon={Video} title="插入影片" />

        {/* Embed */}
        <TBtn onClick={() => setShowEmbedModal(true)}
          icon={Code} title="嵌入程式碼" />

        <Sep />

        {/* Undo / Redo */}
        <TBtn onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()} icon={Undo2} title="復原" />
        <TBtn onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()} icon={Redo2} title="重做" />
      </div>

      {/* ── Editor Content ─────────────────────────────────────────────────── */}
      <EditorContent editor={editor} />

      {/* ── Image Modal ────────────────────────────────────────────────────── */}
      {showImageModal && (
        <ImageModal
          onClose={() => setShowImageModal(false)}
          onInsert={(url) => {
            editor.chain().focus().setImage({ src: url }).run();
            setShowImageModal(false);
          }}
        />
      )}

      {/* ── Video Modal ────────────────────────────────────────────────────── */}
      {showVideoModal && (
        <VideoModal
          editor={editor}
          onClose={() => setShowVideoModal(false)}
        />
      )}

      {/* ── Embed Modal ────────────────────────────────────────────────────── */}
      {showEmbedModal && (
        <EmbedModal
          editor={editor}
          onClose={() => setShowEmbedModal(false)}
        />
      )}

      {/* ── Link Modal ─────────────────────────────────────────────────────── */}
      {showLinkModal && (
        <LinkModal
          editor={editor}
          onClose={() => setShowLinkModal(false)}
        />
      )}
    </div>
  );
}

/* ── Image Modal ───────────────────────────────────────────────────────────── */
function ImageModal({ onClose, onInsert }: { onClose: () => void; onInsert: (url: string) => void }) {
  const [tab, setTab] = useState<'upload' | 'url'>('upload');
  const [url, setUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async (file: File) => {
    setUploading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('image', file);
      const token = sessionStorage.getItem('laoj_admin_token') || '';
      const res = await fetch('/api/admin/upload/blog-image', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        onInsert(data.url);
      } else {
        setError(data.error || '上傳失敗');
      }
    } catch {
      setError('網路錯誤，請稍後再試');
    } finally {
      setUploading(false);
    }
  }, [onInsert]);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900">插入圖片</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          <button type="button"
            onClick={() => setTab('upload')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'upload' ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            <Upload className="w-3.5 h-3.5" /> 上傳圖片
          </button>
          <button type="button"
            onClick={() => setTab('url')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'url' ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            <Globe className="w-3.5 h-3.5" /> 圖片網址
          </button>
        </div>

        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

        {tab === 'upload' ? (
          <div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); }} />
            <button type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full border-2 border-dashed border-gray-200 rounded-xl py-10 text-center hover:border-slate-400 hover:bg-gray-50 transition-colors disabled:opacity-50">
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <span className="text-sm text-gray-500">
                {uploading ? '上傳中…' : '點擊選擇圖片（JPG / PNG / WebP / GIF，最大 5MB）'}
              </span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-400"
            />
            <button type="button"
              onClick={() => { if (url.trim()) onInsert(url.trim()); }}
              disabled={!url.trim()}
              className="w-full bg-slate-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-40">
              插入圖片
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Video Modal ───────────────────────────────────────────────────────────── */
function VideoModal({ editor, onClose }: { editor: any; onClose: () => void }) {
  const [tab, setTab] = useState<'upload' | 'youtube'>('youtube');
  const [url, setUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const isYoutubeUrl = (u: string) =>
    /(?:youtube\.com\/(?:watch|embed|shorts)|youtu\.be\/)/.test(u);

  const handleInsertYoutube = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    if (isYoutubeUrl(trimmed)) {
      editor.chain().focus().setYoutubeVideo({ src: trimmed }).run();
      onClose();
    } else {
      // 非 YouTube 連結，當作一般影片網址插入 <video> 標籤
      insertVideo(trimmed);
    }
  };

  const insertVideo = (videoUrl: string) => {
    editor.chain().focus().setVideo({ src: videoUrl }).run();
    onClose();
  };

  const handleUpload = useCallback(async (file: File) => {
    setUploading(true);
    setUploadProgress(0);
    setError('');
    try {
      const form = new FormData();
      form.append('video', file);
      const token = sessionStorage.getItem('laoj_admin_token') || '';

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/admin/upload/blog-video');
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        setUploading(false);
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          if (data.url) {
            insertVideo(data.url);
          } else {
            setError(data.error || '上傳失敗');
          }
        } else {
          try {
            const data = JSON.parse(xhr.responseText);
            setError(data.error || '上傳失敗');
          } catch {
            setError('上傳失敗');
          }
        }
      };

      xhr.onerror = () => {
        setUploading(false);
        setError('網路錯誤，請稍後再試');
      };

      xhr.send(form);
    } catch {
      setUploading(false);
      setError('網路錯誤，請稍後再試');
    }
  }, [editor, onClose]);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900">插入影片</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          <button type="button"
            onClick={() => setTab('youtube')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'youtube' ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            <Globe className="w-3.5 h-3.5" /> 影片連結
          </button>
          <button type="button"
            onClick={() => setTab('upload')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'upload' ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            <Upload className="w-3.5 h-3.5" /> 上傳影片
          </button>
        </div>

        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

        {tab === 'youtube' ? (
          <div className="space-y-3">
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... 或影片網址"
              autoFocus
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-400"
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleInsertYoutube(); } }}
            />
            <p className="text-xs text-gray-400">支援 YouTube 連結或其他影片網址</p>
            <button type="button"
              onClick={handleInsertYoutube}
              disabled={!url.trim()}
              className="w-full bg-slate-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-40">
              插入影片
            </button>
          </div>
        ) : (
          <div>
            <input ref={fileRef} type="file" accept="video/mp4,video/webm,video/ogg,video/quicktime" className="hidden"
              onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); }} />
            <button type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full border-2 border-dashed border-gray-200 rounded-xl py-10 text-center hover:border-slate-400 hover:bg-gray-50 transition-colors disabled:opacity-50">
              <Video className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              {uploading ? (
                <div className="space-y-2">
                  <span className="text-sm text-gray-500">上傳中… {uploadProgress}%</span>
                  <div className="w-48 mx-auto bg-gray-200 rounded-full h-2">
                    <div className="bg-slate-900 h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              ) : (
                <span className="text-sm text-gray-500">
                  點擊選擇影片（MP4 / WebM / OGG / MOV，最大 100MB）
                </span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Embed Modal ───────────────────────────────────────────────────────────── */
function EmbedModal({ editor, onClose }: { editor: any; onClose: () => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleInsert = () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    // Basic validation: must contain iframe, embed, blockquote, or video tag
    if (!/<(iframe|embed|blockquote|video|div|script)\b/i.test(trimmed)) {
      setError('請貼上有效的嵌入程式碼（如 iframe、embed 等）');
      return;
    }
    editor.chain().focus().setEmbed({ html: trimmed }).run();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900">嵌入程式碼</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

        <div className="space-y-3">
          <textarea
            value={code}
            onChange={e => { setCode(e.target.value); setError(''); }}
            rows={6}
            placeholder={'貼上嵌入程式碼，例如：\n<iframe src="https://www.facebook.com/plugins/video.php?..." ...></iframe>'}
            autoFocus
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-slate-400 resize-none"
          />
          <p className="text-xs text-gray-400">支援 Facebook、Instagram、Twitter、Vimeo 等平台的嵌入程式碼</p>
          <button type="button"
            onClick={handleInsert}
            disabled={!code.trim()}
            className="w-full bg-slate-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-40">
            插入嵌入內容
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Link Modal ────────────────────────────────────────────────────────────── */
function LinkModal({ editor, onClose }: { editor: any; onClose: () => void }) {
  const existingHref = editor.getAttributes('link').href || '';
  const [url, setUrl] = useState(existingHref);

  const handleSave = () => {
    if (!url.trim()) {
      // Remove link
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
    }
    onClose();
  };

  const handleRemove = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900">插入連結</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">連結網址</label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://example.com"
              autoFocus
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-400"
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSave(); } }}
            />
            <p className="text-xs text-gray-400 mt-1.5">先選取文字再點擊連結按鈕，或直接輸入網址</p>
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={handleSave}
              className="flex-1 bg-slate-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors">
              {url.trim() ? '套用連結' : '移除連結'}
            </button>
            {existingHref && (
              <button type="button" onClick={handleRemove}
                className="px-4 py-3 rounded-xl text-sm font-medium text-red-500 bg-red-50 hover:bg-red-100 transition-colors">
                移除
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
