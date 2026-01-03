import crypto from 'crypto';

/**
 * 向伺服器請求登入用公鑰
 */
async function requestKey(server_url) {
  const res = await fetch(`${server_url}:8787/getKey`, {
    method: 'GET'
  });

  if (!res.ok) {
    throw new Error('getKey request failed');
  }

  return await res.json();
}

/**
 * 登入並建立驗證金鑰
 */
export async function login(username, password, server_url) {
  //const server_url = storage.getItem('server_url');

  /* 1. 取得伺服器公鑰 */
  const keyRequested = await requestKey(server_url);
  const { id, publicKey: serverPublicKey } = keyRequested;

  /* 2. 使用伺服器公鑰加密帳密 */
  const encryptedData = crypto.publicEncrypt(
    serverPublicKey,
    Buffer.from(JSON.stringify({ username, password }), 'utf8')
  ).toString('base64');

  /* 3. 產生客戶端 RSA key pair */
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });

  let publicKeyPEM = publicKey.export({
    type: 'pkcs1',
    format: 'pem'
  });

  /* 4. 用伺服器公鑰加密客戶端公鑰 */
  const encryptedPublicKeyPEM = crypto.publicEncrypt(
    serverPublicKey,
    Buffer.from(publicKeyPEM, 'utf8')
  ).toString('base64');

  /* 5. 發送登入請求 */
  const res = await fetch(`${server_url}:8787/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      encryptedData,
      publicKeyPEM: encryptedPublicKeyPEM,
      id
    })
  });

  if (!res.ok) {
    throw new Error('login request failed');
  }

  const login_res = await res.json();

  /* 6. 處理登入結果 */
  if (login_res.status !== 'success') {
    return false;
  }

  /* 7. 解密伺服器回傳的 verifyKey */
  const verifyKey = crypto.privateDecrypt(
    privateKey,
    Buffer.from(login_res.verifyKey, 'base64')
  ).toString('utf8');

  return {login_user: login_res.username, verifyKey};
}
