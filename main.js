const { app, BrowserWindow ,ipcMain,Tray,Menu} = require('electron')
const { dialog, shell } = require("electron");
const path = require('path');
const storage = require('electron-localstorage');
const fs = require('fs');
const { start } = require('repl');
const isDevelopment = process.env.NODE_ENV !== "production";
const config = require('./config/index');

let broadcastEvent = null;
let broadcastState = null;

let services = {};
const version = "2.7.0";

async function checkUpdate(currentVer) {
  let response = await fetch("http://rfeqserver.myqnapcloud.com:8787/monitorVersion");
  let text = await response.text();
  if(currentVer != text) return { status: "New update available", ver: text}
  else return { status: "Already latest version", ver: text}
}

function showUpdatePrompt(mainWindow, latestVersion) {
  //if (!appJustLaunched) return;
  //if (updatePromptShown) return;
  dialog.showMessageBox(mainWindow, {
    type: "info",
    title: "有新版本可用",
    message: `偵測到新版本 ${latestVersion}`,
    detail: "是否前往下載頁面進行更新？",
    buttons: ["前往下載", "稍後再說"],
    defaultId: 0,
    cancelId: 1,
    noLink: true
  }).then(result => {
    if (result.response === 0) {
      shell.openExternal("https://rfeqserver.myqnapcloud.com/RFEQservice");
    }
  });
}

async function bootServices() {
  const {
    startWebSocket,
    setVerifyKey,
    wsVerify
  } = await import('./main/wsClient.mjs');

  const ipcRouter = await import('./main/ipcRouter.mjs');

  broadcastEvent = ipcRouter.broadcastEvent;
  broadcastState = ipcRouter.broadcastState;


  const { login } = await import('./main/auth.mjs');

  const { registerTimeIPC } = await import('./main/ntp/ipcRouter.mjs');
  registerTimeIPC();

  const { syncNTP } = await import('./main/ntp/ntp.mjs');
  await syncNTP(); // App 啟動時先同步一次
  /*
  const { 
    syncNTP, 
    getNtpOffset 
  } = await import ('./ntp.mjs');
   */
  //如果有verifyKey， 則輸入websocket
  let verifyKey = config.get("verifyKey");
  if(verifyKey){
    console.log("[main]setting verifyKey")
    setVerifyKey(verifyKey);
  }
  
  // 啟動 WebSocket
  startWebSocket(
    (ch, data) => broadcastEvent(ch, data),
    (ch, data) => broadcastState(ch, data),
    {
      onLogin: (status, user) => {
        console.log("[main]On login")
        if(status == "success"){
          config.set("login_user", user);
        }else{
          config.set("login_user", "");
        }
      }
    }
  );

  ipcMain.handle('auth:login', async (event, username, password) => {
      const{ login_user, verifyKey } = await login(username, password, await config.get("server_url"))
      if(verifyKey){
        config.set("verifyKey", verifyKey);
        setVerifyKey(verifyKey);
        wsVerify();
      }
  })

  ipcMain.handle('auth:logout', async (event) => {
      config.set("verifyKey", "");
      app.relaunch();
      app.exit();
  })

  const report = await import("./main/report.mjs");
  ipcMain.handle('eq:reportDistribution', async (event, id) => {
    return await report.getInfoDistribution(id);
  })

  /*----------檢查是否有更新----------*/
  setInterval(
    async () => { 
      broadcastState("update:status", await checkUpdate(version)) 
    },
    30000
  )
  /*----------webhook----------*/
  const { send_webhook } = await import("./main/webhook.mjs")
  ipcMain.handle('webhook:send', async (event, url, sendContent) => {
    send_webhook(url, sendContent)
  })
  return { setVerifyKey };  
}


/*----------處理設定檔----------*/
config.applyDefaults();
//console.log(storage.getAll());
config.repairIfBroken();
config.backupConfig();

/*----------建立視窗----------*/
let setting_win = null;
let win =  null;

const createWindow = async () => {
    win = new BrowserWindow({
      width: 1250,
      height: 800,
      minHeight: 750,
      minWidth: 1000,
      webPreferences:{
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: true,
        contextIsolation: true,
        enableRemoteModule: true,
        backgroundThrottling: false,
        nativeWindowOpen: true,
      }
    })
  
    win.loadFile('index.html')

    // 顯示更新視窗(如果有)
    let update = await checkUpdate(version);
    if(update.status == "New update available"){
      showUpdatePrompt(win, update.ver);
    }

    setting_win = new BrowserWindow({
      height:600,
      width:800,
      minHeight: 600,
      minWidth: 800,
      webPreferences:{
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: true,
        contextIsolation: true,
        enableRemoteModule: true,
        backgroundThrottling: false,
        nativeWindowOpen: true,
      }
    })
    setting_win.loadFile('setting.html');

    announcement_win = new BrowserWindow({
      height:600,
      width:800,
      minHeight: 600,
      minWidth: 800,
      webPreferences:{
        devTools: false,
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
        backgroundThrottling: false,
        nativeWindowOpen: true,
      }
    })
    announcement_win.loadFile('announcement.html');

    setting_win.hide();
    setting_win.on('close', (event) => {
      if (app.quitting) {
        setting_win = null;
      } else {
        event.preventDefault()
        setting_win.hide();
      }
    })

    announcement_win.hide();
    announcement_win.on('close', (event) => {
      if (app.quitting) {
        announcement_win = null;
      } else {
        event.preventDefault()
        announcement_win.hide();
      }
    })
    win.on('close', ((event) => {
      if (process.platform !== 'darwin' && storage.getItem('minimize_to_tray') == 'false') {
        app.quit()
      }else{
        if (app.quitting) {
          win = null;
        } else {
          event.preventDefault();
          win.hide();
        }
      }
    })
  )
}

app.whenReady().then(async () => {
    // 建立視窗
    await createWindow()

    //開啟websocket
    services = await bootServices();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

    //開機自啟動
    let autolaunch = config.config().system.autoLaunch;
    app.setLoginItemSettings({
      openAtLogin: autolaunch,      // 是否開機自啟動
      openAsHidden: false      // 啟動時不顯示視窗（Windows/macOS）
    });

    //tray
    if(storage.getItem('minimize_to_tray') != 'false'){
      const tray = new Tray(path.join(__dirname, 'icon.png'))
      console.log(path.join(__dirname, 'icon.png'))
      // 設定選單樣板
      const contextMenu = Menu.buildFromTemplate([
        { label: '設定' ,click:()=>setting_win.show()},
        { label: '重新啟動' , click:() => {
          app.relaunch();
          app.exit();
          }
        },
        { label: '關閉RF-monitor' ,click:()=>{
          if (process.platform !== 'darwin') app.quit()
          } 
        },
      ])
      // 右下角 icon 被 hover 時的文字
      tray.setToolTip('RF-monitor')
      // 設定定應用程式右下角選單
      tray.setContextMenu(contextMenu)
      tray.on('click', () => {
        win.show();
      })
      tray.on('right-click', () => {
        tray.popUpContextMenu(menu);
      })
    }
})


if (app.isPackaged) {
  const electron = require('electron')

  const menu = electron.Menu

  menu.setApplicationMenu(null)

}


app.on('before-quit', () => app.quitting = true)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle('auth:setVerifyKey', (_, key) => {
  services.setVerifyKey?.(key);
});

ipcMain.handle('config:getAll', () => {
  return config.config()
});
ipcMain.handle('config:get', (_, key) => {
  // console.log("[main] getting config",key);
  return config.get(key);
})
ipcMain.handle('config:set', (_, key, value) => {
  console.log("[main] setting config",key ,value)
  config.set(key, value);
  broadcastEvent?.('event:config:update', {
    key,
    value
  });
})

ipcMain.on('showSetting',() => {//顯示設定視窗
    setting_win.show();
})

ipcMain.on('showAnnouncement',() => {//顯示加入測站視窗
    announcement_win.show();
    announcement_win.webContents.send('refresh', 'refresh');
})

ipcMain.on('hideSetting',() => {//隱藏設定視窗
  setting_win.hide();
})

ipcMain.on('restart',() => {//重新啟動
    app.relaunch();
    app.exit();
})
ipcMain.on('showMain',() => {//顯示主視窗
    win.show()
})
ipcMain.on('EEWsim_submit', (event, data) => {
  console.log(data)
  win.webContents.send('EEWsim', data);
});
ipcMain.on('needNTP', () => {
  win.webContents.send('needNtp');
});
if (process.platform === 'win32')
{
    app.setAppUserModelId(app.name);
}

/*----------檢查更新----------*/
