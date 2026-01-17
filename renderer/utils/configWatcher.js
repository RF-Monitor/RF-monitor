const listeners = new Map();
/*
listeners 結構：
Map {
  "minimize_to_tray" => Set([fn1, fn2]),
  "server_url"       => Set([fn3])
}
*/

export function onConfigChange(key, callback) {
  if (!listeners.has(key)) {
    listeners.set(key, new Set());
  }
  listeners.get(key).add(callback);

  // 回傳 unsubscribe，避免 memory leak
  return () => {
    listeners.get(key)?.delete(callback);
  };
}

export function emitConfigChange({ key, value }) {
  if (!listeners.has(key)) return;

  for (const cb of listeners.get(key)) {
    try {
      cb(value);
    } catch (err) {
      console.error(`[config] listener error (${key})`, err);
    }
  }
}