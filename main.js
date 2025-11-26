const { app, BrowserWindow ,ipcMain,Tray,Menu} = require('electron')
const path = require('path');
const storage = require('electron-localstorage');
const fs = require('fs');
const { start } = require('repl');
//require("./trem-core/index.js")
const isDevelopment = process.env.NODE_ENV !== "production";
const config = require('./config');

config.repairIfBroken();
config.applyDefaults();
let setting_win = null;
let win =  null;

const createWindow = () => {
    win = new BrowserWindow({
      width: 1250,
      height: 800,
      minHeight: 750,
      minWidth: 1000,
      webPreferences:{
        nodeIntegration: true,
        contextIsolation: false,
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

app.whenReady().then(() => {
    createWindow()
   /* const tray = new Tray('icon.png')
    // 設定選單樣板
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Item1', click: () => { console.log('click') } },
      { label: 'Item2' },
    ])
    // 右下角 icon 被 hover 時的文字
    tray.setToolTip('RF-monitor')
    // 設定定應用程式右下角選單
    tray.setContextMenu(contextMenu)*/
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
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