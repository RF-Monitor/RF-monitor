let ntpOffset = 0;
let syncing = false;

/**
 * 同步 NTP
 */
export async function syncNTP({
  url = 'https://rfeqserver.myqnapcloud.com/ntp',
  retryDelay = 1000
} = {}) {
  if (syncing) return ntpOffset;
  syncing = true;

  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    if (!data?.unixtime) throw new Error('Invalid NTP response');

    const serverTime = data.unixtime * 1000;
    ntpOffset = serverTime - Date.now();

    console.log('[NTP] offset =', ntpOffset);
    return ntpOffset;

  } catch (err) {
    console.warn('[NTP] sync failed:', err.message);
    await delay(retryDelay);
    return syncNTP({ url, retryDelay });

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
