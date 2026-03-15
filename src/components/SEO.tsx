import { Helmet } from 'react-helmet-async';

const SITE_NAME = '老J AI 實驗室';
const SITE_URL = 'https://www.oldjailab.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
  ogType?: string;
  ogImage?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  /** article:published_time (ISO 8601) */
  publishedTime?: string;
  /** article:modified_time (ISO 8601) */
  modifiedTime?: string;
  /** article:author */
  articleAuthor?: string;
  /** article:section (category) */
  articleSection?: string;
  /** article:tag (array) */
  articleTags?: string[];
}

export default function SEO({
  title,
  description = '老J AI 實驗室：專為一人公司設計的 AI 變現實戰指南。提供精實創業思維、AI 自動化工作流、PLG 商業化路徑。',
  path = '/',
  ogType = 'website',
  ogImage = DEFAULT_OG_IMAGE,
  noindex = false,
  jsonLd,
  publishedTime,
  modifiedTime,
  articleAuthor,
  articleSection,
  articleTags,
}: SEOProps) {
  const fullTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} | AI 變現教學・自動化工具・一人公司實戰`;
  const url = `${SITE_URL}${path}`;

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Language */}
      <html lang="zh-TW" />
      <link rel="alternate" hrefLang="zh-TW" href={url} />
      <link rel="alternate" hrefLang="x-default" href={url} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="zh_TW" />

      {/* Article-specific OG tags */}
      {ogType === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {ogType === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {ogType === 'article' && articleAuthor && (
        <meta property="article:author" content={articleAuthor} />
      )}
      {ogType === 'article' && articleSection && (
        <meta property="article:section" content={articleSection} />
      )}
      {ogType === 'article' && articleTags && articleTags.map((tag, i) => (
        <meta key={`at-${i}`} property="article:tag" content={tag} />
      ))}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD */}
      {jsonLd && (
        Array.isArray(jsonLd)
          ? jsonLd.map((item, i) => (
              <script key={i} type="application/ld+json">
                {JSON.stringify(item)}
              </script>
            ))
          : (
            <script type="application/ld+json">
              {JSON.stringify(jsonLd)}
            </script>
          )
      )}
    </Helmet>
  );
}
