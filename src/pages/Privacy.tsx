import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import SEO from '../components/SEO';

const JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: '隱私權政策 — 老J AI 實驗室',
    description: '老J AI 實驗室的隱私權政策，說明我們如何蒐集、使用、保護您的個人資料，以及 Cookie 與廣告投放政策。',
    url: 'https://www.oldjailab.com/privacy',
    inLanguage: 'zh-TW',
    isPartOf: { '@type': 'WebSite', name: '老J AI 實驗室', url: 'https://www.oldjailab.com' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '首頁', item: 'https://www.oldjailab.com/' },
      { '@type': 'ListItem', position: 2, name: '隱私權政策', item: 'https://www.oldjailab.com/privacy' },
    ],
  },
];

const LAST_UPDATED = '2026 年 3 月 19 日';

export default function Privacy() {
  return (
    <article className="py-20 px-6 max-w-3xl mx-auto">
      <SEO
        title="隱私權政策"
        description="老J AI 實驗室的隱私權政策：Cookie 使用說明、廣告投放政策、個人資料保護方式。"
        path="/privacy"
        jsonLd={JSON_LD}
      />

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-8">
          <Link to="/" className="hover:text-slate-900 transition-colors">首頁</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700">隱私權政策</span>
        </nav>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">隱私權政策</h1>
        <p className="text-sm text-gray-400 mb-10">最後更新日期：{LAST_UPDATED}</p>

        <div className="prose-custom space-y-8">
          {/* 1. 總則 */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">一、總則</h2>
            <p className="text-gray-600 leading-relaxed">
              歡迎使用「老J AI 實驗室」（以下簡稱「本網站」，網址：www.oldjailab.com）。本網站非常重視您的隱私權，並致力於保護您的個人資料。本隱私權政策說明我們如何蒐集、使用、儲存及保護您在使用本網站服務時所提供的資訊。
            </p>
            <p className="text-gray-600 leading-relaxed">
              當您瀏覽或使用本網站時，即表示您已閱讀、瞭解並同意本隱私權政策的所有條款。若您不同意本政策，請勿繼續使用本網站。
            </p>
          </section>

          {/* 2. 資料蒐集 */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">二、我們蒐集的資料</h2>
            <p className="text-gray-600 leading-relaxed mb-3">本網站可能蒐集以下類型的資料：</p>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">1. 您主動提供的資料</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-1 mb-4">
              <li>透過「合作洽談」表單提交的姓名、電子郵件、公司名稱、預算範圍及諮詢內容。</li>
              <li>透過電子報訂閱功能提供的電子郵件地址。</li>
            </ul>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">2. 自動蒐集的資料</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-1">
              <li>瀏覽器類型與版本、作業系統、螢幕解析度。</li>
              <li>IP 位址（匿名化處理）。</li>
              <li>瀏覽頁面、停留時間、點擊行為等使用紀錄。</li>
              <li>透過 Cookie 及類似技術蒐集的資訊（詳見下方 Cookie 說明）。</li>
            </ul>
          </section>

          {/* 3. Cookie 政策 */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">三、Cookie 使用說明</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              本網站使用 Cookie 及類似技術來提升您的瀏覽體驗、分析網站流量，以及提供個人化廣告。Cookie 是放置在您裝置上的小型文字檔案，可幫助網站記住您的偏好設定。
            </p>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">本網站使用的 Cookie 類型：</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-4 py-3 font-semibold text-slate-800">類型</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-800">用途</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-800">提供者</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  <tr className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium">必要性 Cookie</td>
                    <td className="px-4 py-3">維持網站基本功能運作，如登入狀態管理</td>
                    <td className="px-4 py-3">本網站</td>
                  </tr>
                  <tr className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium">分析性 Cookie</td>
                    <td className="px-4 py-3">收集匿名統計資料，協助我們了解訪客如何使用網站，以持續改善服務品質</td>
                    <td className="px-4 py-3">Google Analytics (GA4)</td>
                  </tr>
                  <tr className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium">廣告性 Cookie</td>
                    <td className="px-4 py-3">用於投放與您興趣相關的廣告內容，並衡量廣告成效</td>
                    <td className="px-4 py-3">Google AdSense</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-gray-600 leading-relaxed mt-3">
              您可以透過瀏覽器設定來管理或刪除 Cookie。請注意，停用某些 Cookie 可能會影響網站的部分功能。
            </p>
          </section>

          {/* 4. 廣告投放 */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">四、第三方廣告投放說明</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              本網站使用 Google AdSense 提供廣告服務。Google AdSense 為第三方廣告服務商，可能會使用 Cookie 來根據您先前造訪本網站或其他網站的紀錄，向您投放相關廣告。
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-1">
              <li>Google 會使用廣告 Cookie 來根據使用者造訪本網站和/或網際網路上其他網站的記錄，投放適當的廣告。</li>
              <li>使用者可以前往 <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">Google 廣告設定</a> 選擇停用個人化廣告。</li>
              <li>或者，您也可以造訪 <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">www.aboutads.info</a> 選擇退出第三方廠商使用 Cookie 投放個人化廣告。</li>
            </ul>
          </section>

          {/* 5. 資料使用目的 */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">五、資料使用目的</h2>
            <p className="text-gray-600 leading-relaxed mb-3">我們蒐集的資料僅用於以下目的：</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-1">
              <li>回覆您的合作洽談或諮詢請求。</li>
              <li>發送您訂閱的電子報及相關 AI 實戰資訊。</li>
              <li>分析網站流量與使用模式，以改善網站內容與服務品質。</li>
              <li>投放與您興趣相關的廣告內容。</li>
              <li>遵守法律義務或保護本網站的合法權益。</li>
            </ul>
          </section>

          {/* 6. 資料保護 */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">六、個人資料保護方式</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              我們採取合理的技術與管理措施來保護您的個人資料：
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-1">
              <li>本網站全面使用 HTTPS 加密傳輸，確保資料在傳輸過程中的安全。</li>
              <li>個人資料儲存於受保護的伺服器環境中，僅授權人員可存取。</li>
              <li>定期檢視安全措施，確保資料保護符合最新標準。</li>
              <li>絕不會將您的個人資料出售、交換或出租給任何第三方。</li>
            </ul>
          </section>

          {/* 7. 第三方服務 */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">七、第三方服務</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              本網站使用以下第三方服務，這些服務有各自的隱私權政策：
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-1">
              <li><strong>Google Analytics</strong>：用於網站流量分析。<a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">Google 隱私權政策</a></li>
              <li><strong>Google AdSense</strong>：用於展示廣告。<a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">Google 廣告政策</a></li>
            </ul>
          </section>

          {/* 8. 您的權利 */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">八、您的權利</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              根據相關隱私法規，您享有以下權利：
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-1">
              <li><strong>查閱權</strong>：您有權查閱我們所持有的您的個人資料。</li>
              <li><strong>更正權</strong>：若您的個人資料有誤，您有權要求更正。</li>
              <li><strong>刪除權</strong>：您有權要求我們刪除您的個人資料。</li>
              <li><strong>退訂權</strong>：您可以隨時透過電子報中的「取消訂閱」連結退訂。</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-3">
              如需行使上述權利，請透過 <a href="mailto:contact@laojailab.com" className="text-blue-600 hover:text-blue-700 underline">contact@laojailab.com</a> 與我們聯繫。
            </p>
          </section>

          {/* 9. 兒童隱私 */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">九、兒童隱私保護</h2>
            <p className="text-gray-600 leading-relaxed">
              本網站不針對 16 歲以下的兒童提供服務，也不會故意蒐集兒童的個人資料。若我們發現不慎蒐集了兒童的個人資料，將立即刪除。
            </p>
          </section>

          {/* 10. 政策更新 */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">十、隱私權政策變更</h2>
            <p className="text-gray-600 leading-relaxed">
              本網站保留隨時修改本隱私權政策的權利。任何修改將於本頁面公布，並更新「最後更新日期」。建議您定期瀏覽本頁面以瞭解最新的隱私權政策。
            </p>
          </section>

          {/* 11. 聯繫方式 */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">十一、聯繫方式</h2>
            <p className="text-gray-600 leading-relaxed">
              若您對本隱私權政策有任何疑問或建議，歡迎透過以下方式與我們聯繫：
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-1 mt-2">
              <li>Email：<a href="mailto:contact@laojailab.com" className="text-blue-600 hover:text-blue-700 underline">contact@laojailab.com</a></li>
              <li>合作洽談頁面：<Link to="/contact" className="text-blue-600 hover:text-blue-700 underline">www.oldjailab.com/contact</Link></li>
            </ul>
          </section>
        </div>
      </motion.div>
    </article>
  );
}
