import WebSocket from 'ws';
import crypto from 'crypto';

let heartbeatTimer = null;
let lastPongTime = 0;

const HEARTBEAT_INTERVAL = 5000;   // 每 5 秒檢查一次
const HEARTBEAT_TIMEOUT  = 3000;  // 3 秒沒 pong  視為斷線

let socket = null;
let verifyKey = '';
let reconnectTimer = null;
let reconnecting = false;

let sendEvent = null;
let sendState = null;
let onLoginCb = null;

const WS_URL = 'ws://RFEQSERVER.myqnapcloud.com:8788';
const RECONNECT_DELAY = 3000;

export function setVerifyKey(key) {
  verifyKey = key || '';
}

export function startWebSocket(Event, State, { onLogin } = {}) {
  sendEvent = Event;
  sendState = State;
  onLoginCb = onLogin;

  connect();
}

function startHeartbeat() {
  stopHeartbeat(); // 確保不疊加

  heartbeatTimer = setInterval(() => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    const pingTime = Date.now();
    let timeoutTimer = null;

    const onPong = () => {
      clearTimeout(timeoutTimer);
      lastPongTime = Date.now();
      //console.log('[WS] pong received, rtt =', lastPongTime - pingTime);
      sendState?.('ws:ping', { ping: lastPongTime - pingTime });
    };

    try {
      // 只等待「下一個」pong
      socket.once('pong', onPong);

      // 發送 ping
      socket.ping();

      // pong 超時判定
      timeoutTimer = setTimeout(() => {
        socket.off('pong', onPong);
        console.warn('[WS] pong timeout, force terminate');
        socket.terminate();
      }, HEARTBEAT_TIMEOUT);

    } catch (err) {
      console.error('[WS ping error]', err.message);
    }
  }, HEARTBEAT_INTERVAL);
}


function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

function connect() {
  reconnectTimer && clearTimeout(reconnectTimer);
  reconnectTimer = null;

  if (socket) {
    socket.removeAllListeners();
    socket.terminate();
    socket = null;
  }
  sendState?.('ws:status', { status: 'connecting' });

  socket = new WebSocket(WS_URL);

  socket.once('open', () => {
    sendState?.('ws:status', { status: 'online' });

    lastPongTime = Date.now();
    startHeartbeat();

    if (verifyKey) {
      wsVerify();
    } else {
      sendState?.('auth:status', { status: 'logged_out' });
    }
  });

  socket.on('message', raw => {
    let data;
    try {
      data = JSON.parse(raw.toString());
    } catch {
      return;
    }
    routeMessage(data);
  });

  socket.on('pong', () => {
    lastPongTime = Date.now();
  });

  socket.once('close', onClose);
  socket.once('error', onError);
}

function onError(err) {
  console.error('[WS error]', err.message);
  handleDisconnect();
}

function onClose(code, reason) {
  console.warn('[WS closed]', code, reason?.toString());
  handleDisconnect();
}

function handleDisconnect() {
  stopHeartbeat();

  sendState?.('ws:status', { status: 'offline' });

  if (reconnectTimer) return;

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connect();
  }, RECONNECT_DELAY);
}

export function wsVerify() {
  if (!socket || socket.readyState !== WebSocket.OPEN) return;

  sendState?.('auth:status', { status: 'logging_in' });
  socket.send(JSON.stringify({ request: 'getKey' }));
}

function routeMessage(data) {
  const { type, content } = data;

  switch (type) {
    case 'eew_tw':
      sendEvent?.('event:eew:tw', content);
      break;

    case 'eew_JP':
      sendEvent?.('event:eew:jp', content);
      break;

    case 'RFPLUS2':
      sendEvent?.('event:rfplus:2', content);
      break;

    case 'RFPLUS3':
      sendEvent?.('event:rfplus:3', content);
      break;

    case 'report':
      sendEvent?.('event:eq:report', content);
      break;

    case 'weather':
      sendEvent?.('event:weather:alert', content);
      break;
    case 'typhoon':
      sendEvent?.('event:weather:typhoon', content);
      break;

    case 'pga':
      sendEvent?.('event:pga', content);
      break;

    case 'tsunami':
      sendEvent?.('event:tsunami', content);
      break;

    case 'key':
      handleKeyExchange(data.key);
      break;

    case 'login':
      if (data.status === 'success') {
        sendState?.('auth:status', { status: 'logged_in' });
      }
      onLoginCb?.(data.status, data.user);
      sendState?.('auth:result', data);
      break;
  }
}

function handleKeyExchange(publicKey) {
  if (!verifyKey || !socket) return;

  const encrypted = crypto.publicEncrypt(
    publicKey,
    Buffer.from(verifyKey, 'utf8')
  ).toString('base64');

  socket.send(JSON.stringify({
    request: 'verify',
    key: encrypted
  }));
}
