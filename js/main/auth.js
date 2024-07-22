/*const axios = require('axios');
const crypto = require('crypto');
const { serialize } = require('v8');
*/
//server_url = storage.getItem('server_url');

// 生成帳號和密碼
const username = 'myusername';
const password = 'mypassword';
XHR_login = createXHR();
XHR_register = createXHR()

function requestKey() {
  XHR_login.open('GET',server_url + ':8787/getKey',false);
  XHR_login.send(null);
  return JSON.parse(XHR_login.responseText);
}

function login(){
  //請求公鑰
  document.getElementById("login_btn").innerHTML = "登入中...";
  document.getElementById("login_btn").disabled = true;
  const username = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const keyRequested = requestKey() 
  //公鑰ID
  let id = keyRequested["id"];
  //公鑰
  let publicKeyFromServer = keyRequested["publicKey"];
  //將帳密加密
  const encryptedData = crypto.publicEncrypt(publicKeyFromServer,Buffer.from(JSON.stringify({username,password}),'utf8')).toString('base64')
  //生成新的非對稱金鑰
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });
  //輸出公鑰字串
  let publicKeyPEM = publicKey.export({type:'pkcs1',format:'pem'})
  //加密公鑰
  publicKeyPEM = crypto.publicEncrypt(publicKeyFromServer,Buffer.from(publicKeyPEM,'utf8')).toString('base64')
  console.log(encryptedData)
  
  axios.post(server_url + ':8787/login',{encryptedData,publicKeyPEM,id})
    .then(response=>{
      console.log(response.data)
      let login_res = response.data;
      const login_status = login_res.status;
      const login_username = login_res.username; 
      if(login_status == "success"){
        let verifyKey = login_res.verifyKey
        verifyKey = crypto.privateDecrypt(privateKey, Buffer.from(verifyKey, 'base64')).toString('utf8');
        storage.setItem('login_user',login_username);
        storage.setItem('verifyKey',verifyKey);
        ipcRenderer.send('restart');
      }else{
        document.getElementById("login_btn").disabled = false;
        document.getElementById("login_failed").style.display = "block";
        document.getElementById("login_btn").innerHTML = "登入";
      }
    })
}









function getCaptcha(){
  XHR_register.open('GET',server_url + ':8787/captcha',false);
  XHR_register.send(null);
  document.getElementById("captcha_img").innerHTML = XHR_register.responseText
}
function register(){
  const username = document.getElementById('email_register').value;
  const password = document.getElementById('password_register').value;
  const password_again = document.getElementById('password_again').value;
  const captcha = document.getElementById('captcha').value;
  if(password == password_again){
    axios.post(server_url + ':8787/register',{username,password,captcha})
    .then(response=>{
      if(response.data.status == "success"){
        //到信箱驗證
      }else{
        //註冊失敗，請檢查驗證碼
      }
    })
  }else{
  }
}
