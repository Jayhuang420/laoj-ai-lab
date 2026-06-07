// Discord 通知：有人領取免費指南／加入名單時，發訊息到 Discord 頻道（webhook）。
//
// 注意：Discord 走 Cloudflare，會把預設的程式 User-Agent（node/undici、python-urllib 等）
// 當成機器人擋掉回 403 Forbidden。因此一定要帶一個「正常」的 User-Agent。
// webhook URL 走環境變數 DISCORD_WEBHOOK_URL，未設定時靜默略過（不影響主流程）。

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || '';

export async function notifyDiscordLead(opts: {
  name?: string;
  email?: string;
  phone?: string;
  source?: string;
}): Promise<boolean> {
  if (!DISCORD_WEBHOOK_URL) return false;
  const { name, email, phone, source } = opts;
  const content =
    '🎁 **有新使用者領取了免費指南！**\n' +
    `• 來源：${source || '官網'}\n` +
    `• 稱呼：${name || '(未填)'}\n` +
    `• Email：${email || '(未填)'}` +
    (phone ? `\n• 電話：${phone}` : '');
  try {
    const resp = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; oldjailab-bot/1.0; +https://oldjailab.com)',
      },
      body: JSON.stringify({ content }),
    });
    if (!resp.ok) console.error('[discord] 通知失敗 HTTP', resp.status);
    return resp.ok;
  } catch (err: any) {
    console.error('[discord] 通知失敗:', err?.message || err);
    return false;
  }
}
