import { Client } from '@notionhq/client';

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DB_ID = process.env.NOTION_DB_ID;

let notion: Client | null = null;

if (NOTION_TOKEN && NOTION_DB_ID) {
  notion = new Client({ auth: NOTION_TOKEN });
  console.log('[notion] Notion 整合已啟用。');
} else {
  console.warn('[notion] NOTION_TOKEN 或 NOTION_DB_ID 未設定，Notion 整合已停用。');
}

interface InquiryData {
  name: string;
  email: string;
  company: string;
  service_type: string;
  budget: string;
  message: string;
  created_at: string;
}

function getPriority(budget: string): string {
  if (budget.includes('50 萬以上')) return '高';
  if (budget.includes('30-50 萬') || budget.includes('10-30 萬')) return '中';
  return '低';
}

/** 將 SQLite datetime 格式 (YYYY-MM-DD HH:MM:SS) 轉為 ISO-8601 */
function toISO(dateStr: string): string {
  if (!dateStr) return new Date().toISOString();
  // 如果已經是 ISO 格式就直接回傳
  if (dateStr.includes('T')) return dateStr;
  // SQLite datetime('now','+8 hours') → "2026-03-09 15:30:00"
  // 轉成 "2026-03-09T15:30:00+08:00"
  return dateStr.replace(' ', 'T') + '+08:00';
}

export async function createNotionInquiry(inquiry: InquiryData): Promise<string | null> {
  if (!notion || !NOTION_DB_ID) {
    console.warn('[notion] Notion 未設定，跳過寫入。');
    return null;
  }

  try {
    const priority = getPriority(inquiry.budget);

    const response = await notion.pages.create({
      parent: { database_id: NOTION_DB_ID },
      properties: {
        '姓名': {
          title: [{ text: { content: inquiry.name } }],
        },
        'Email': {
          email: inquiry.email,
        },
        '公司': {
          rich_text: [{ text: { content: inquiry.company || '未填寫' } }],
        },
        '服務類型': {
          select: { name: inquiry.service_type || '其他' },
        },
        '預算': {
          select: { name: inquiry.budget || '再討論' },
        },
        '訊息摘要': {
          rich_text: [{ text: { content: inquiry.message.slice(0, 2000) } }],
        },
        '狀態': {
          select: { name: '新諮詢' },
        },
        '優先級': {
          select: { name: priority },
        },
        '提交時間': {
          date: { start: toISO(inquiry.created_at) },
        },
      },
    });

    console.log(`[notion] 已建立諮詢頁面: ${response.id}`);
    return response.id;
  } catch (err: any) {
    console.error('[notion] 寫入失敗:', err.message);
    if (err.body) console.error('[notion] 詳細錯誤:', JSON.stringify(err.body));
    return null;
  }
}
