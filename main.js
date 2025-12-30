const { app, BrowserWindow ,ipcMain,Tray,Menu} = require('electron')
const path = require('path');
const storage = require('electron-localstorage');
const fs = require('fs');
const { start } = require('repl');
//require("./trem-core/index.js")
const isDevelopment = process.env.NODE_ENV !== "production";
const config = require('./config');

let services = {};

async function bootServices() {
  const {
    startWebSocket,
    setVerifyKey
  } = await import('./main/wsClient.mjs');

  const {
    broadcastEvent,
    broadcastState
  } = await import('./main/ipcRouter.mjs');

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
  // 啟動 WebSocket
  startWebSocket(
    (ch, data) => broadcastEvent(ch, data),
    (ch, data) => broadcastState(ch, data)
  );

  return { setVerifyKey };
}


/*----------處理設定檔----------*/
config.repairIfBroken();
config.applyDefaults();

/*----------建立視窗----------*/
let setting_win = null;
let win =  null;

const createWindow = () => {
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

    setting_win = new BrowserWindow({
      height:600,
      width:800,
      minHeight: 600,
      minWidth: 800,
      webPreferences:{
        nodeIntegration: true,
        contextIsolation: false,
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
    createWindow()

    //開啟websocket
    services = await bootServices();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

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

ipcMain.handle('config:getAll', () => config.config);

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
ipcMain.on('EEWsim_sub', (event, data) => {
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