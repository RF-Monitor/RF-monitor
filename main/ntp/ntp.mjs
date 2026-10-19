let ntpOffset = 0;
let syncing = false;

/**
 * 同步 NTP
 */
export async function syncNTP({
  url = 'https://rptes.com/ntp',
  retryDelay = 1000,
  timeout = 5000,
  maxAttempts = 3
} = {}) {
  if (syncing) return ntpOffset;
  syncing = true;

  try {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);

      try {
        const res = await fetch(url, { cache: 'no-store', signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        if (typeof data?.unixtime !== 'number' || !Number.isFinite(data.unixtime)) {
          throw new Error('Invalid NTP response');
        }

        const serverTime = data.unixtime * 1000;
        ntpOffset = serverTime - Date.now();

        console.log('[NTP] offset =', ntpOffset);
        return ntpOffset;
      } catch (err) {
        console.warn(`[NTP] sync failed (${attempt}/${maxAttempts}):`, err.message);
        if (attempt === maxAttempts) throw err;
      } finally {
        clearTimeout(timer);
      }

      await delay(retryDelay);
    }
  } finally {
    syncing = false;
  }
}

export function getNtpOffset() {
  return ntpOffset;
}

export function now() {
  return Date.now() + ntpOffset;
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}
