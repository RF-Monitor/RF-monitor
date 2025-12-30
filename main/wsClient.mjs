import WebSocket from 'ws';
import crypto from 'crypto';

let socket;
let verifyKey = '';

export function setVerifyKey(key) {
  verifyKey = key || '';
}


export function startWebSocket(sendEvent, sendState) {
  socket = new WebSocket('ws://RFEQSERVER.myqnapcloud.com:8788');

  socket.on('open', () => {
    sendState('ws:status', { status: 'online' });

    if (verifyKey) {
      sendState('auth:status', { status: 'logging_in' });
      socket.send(JSON.stringify({ request: 'getKey' }));
    } else {
      sendState('auth:status', { status: 'logged_out' });
    }
  });

  socket.on('message', (raw) => {
    let data;
    try {
      data = JSON.parse(raw.toString());
    } catch {
      return;
    }

    routeMessage(data, sendEvent, sendState);
  });

  socket.on('close', () => {
    sendState('ws:status', { status: 'offline' });
    setTimeout(() => startWebSocket(sendEvent, sendState), 3000);
  });
}

function routeMessage(data, sendEvent, sendState) {
  const { type, content } = data;

  switch (type) {
    case 'eew_tw':
      sendEvent('event:eew:tw', content);
      break;

    case 'eew_jp':
      sendEvent('event:eew:jp', content);
      break;

    case 'RFPLUS2':
      sendEvent('event:rfplus:2', content);
      break;

    case 'RFPLUS3':
      sendEvent('event:rfplus:3', content);
      break;

    case 'report':
      console.log("sending report");
      sendEvent('event:eq:report', content);
      break;

    case 'weather':
      sendEvent('event:weather:alert', content);
      break;

    case 'pga':
      sendEvent('event:pga', content);
      break;

    case 'tsunami':
      sendEvent('event:tsunami', content);
      break;

    case 'key':
      handleKeyExchange(data.key);
      break;

    case 'login':
      sendState('auth:result', data);
      break;
  }
}

function handleKeyExchange(publicKey) {
  if (!verifyKey) return;

  const encrypted = crypto.publicEncrypt(
    publicKey,
    Buffer.from(verifyKey, 'utf8')
  ).toString('base64');

  socket.send(JSON.stringify({
    request: 'verify',
    key: encrypted
  }));
}
