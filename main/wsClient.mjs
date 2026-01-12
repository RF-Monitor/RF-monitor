import WebSocket from 'ws';
import crypto from 'crypto';

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

function connect() {
  if (socket) {
    socket.removeAllListeners();
    socket.terminate();
    socket = null;
  }

  reconnecting = false;
  sendState?.('ws:status', { status: 'connecting' });

  socket = new WebSocket(WS_URL);

  socket.on('open', () => {
    sendState?.('ws:status', { status: 'online' });

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

  socket.on('close', handleDisconnect);
  socket.on('error', handleDisconnect);
}

function handleDisconnect() {
  if (reconnecting) return;

  reconnecting = true;
  sendState?.('ws:status', { status: 'offline' });

  reconnectTimer && clearTimeout(reconnectTimer);
  reconnectTimer = setTimeout(() => {
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

    case 'eew_jp':
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
