import WebSocket from 'ws';
import crypto from 'crypto';

let socket = null;
let verifyKey = '';

let sendEvent = null;
let sendState = null;

export function setVerifyKey(key) {
  verifyKey = key || '';
}

export function wsVerify() {
  if(socket !== null){
    console.log("[ws]requesting key")
    sendState('auth:status', { status: 'logging_in' });
    socket.send(JSON.stringify({ request: 'getKey' }));
  }
}


export function startWebSocket(Event, State, {onLogin} = {}) {
  sendEvent = Event;
  sendState = State
  socket = new WebSocket('ws://RFEQSERVER.myqnapcloud.com:8788');

  socket.on('open', () => {
    sendState('ws:status', { status: 'online' });

    if (verifyKey) {
      wsVerify();
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

    routeMessage(data, sendEvent, sendState, { onLogin });
  });

  socket.on('close', () => {
    sendState('ws:status', { status: 'offline' });
    setTimeout(() => startWebSocket(sendEvent, sendState), 3000);
  });
}

function routeMessage(data, sendEvent, sendState, { onLogin } = {}) {
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
      console.log("[ws]got key")
      handleKeyExchange(data.key);
      break;

    case 'login':
      console.log("[ws]login result:", data)
      let status = data.status;
      let user = data.user;
      if(status == "success"){
        sendState('auth:status', { status: 'logged_in' });
      }
      onLogin?.(status, user);
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
