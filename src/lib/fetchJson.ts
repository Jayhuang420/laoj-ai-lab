/**
 * 帶逾時 + 自動重試的 JSON fetch。
 *
 * 動機：部署（Zeabur 重啟）或網路短暫抽風時，原本的 `fetch('/api/...')`
 * 沒有逾時也不重試，一旦那次請求卡住，呼叫端就會永遠停在 loading（骨架轉不停）。
 * 這個 helper 會在逾時後中止、自動重試幾次，最後仍失敗才丟出錯誤，
 * 讓呼叫端能顯示「載入失敗，可重試」而不是假當機。
 */

export interface FetchJsonOptions {
  /** 單次請求逾時（毫秒）。預設 8000。 */
  timeout?: number;
  /** 失敗後額外重試次數。預設 2（總共最多嘗試 3 次）。 */
  retries?: number;
  /** 重試間隔基數（毫秒），採線性退避。預設 600。 */
  retryDelay?: number;
  /** 視為「成功但無內容」而直接回傳的 HTTP 狀態碼（例如 404）。 */
  treatAsEmpty?: number[];
}

export async function fetchJson<T = any>(url: string, opts: FetchJsonOptions = {}): Promise<T> {
  const { timeout = 8000, retries = 2, retryDelay = 600, treatAsEmpty = [] } = opts;

  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);

      if (treatAsEmpty.includes(res.status)) {
        // 例如 404：明確「沒這筆」，不該重試，直接讓呼叫端處理。
        const err = new Error(`HTTP ${res.status}`) as Error & { status?: number };
        err.status = res.status;
        throw err;
      }

      if (!res.ok) {
        // 5xx / 其他：可能是部署空窗，值得重試。
        throw new Error(`HTTP ${res.status}`);
      }

      return (await res.json()) as T;
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;

      // treatAsEmpty 的狀態碼（如 404）不重試，直接往外丟。
      const status = (err as { status?: number })?.status;
      if (status && treatAsEmpty.includes(status)) throw err;

      // 還有重試次數就等一下再試。
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, retryDelay * (attempt + 1)));
      }
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('fetch failed');
}

/**
 * 不想處理錯誤的非關鍵資料用這個：失敗就回傳 fallback，不丟例外。
 */
export async function fetchJsonSafe<T = any>(
  url: string,
  fallback: T,
  opts?: FetchJsonOptions
): Promise<T> {
  try {
    return await fetchJson<T>(url, opts);
  } catch {
    return fallback;
  }
}
