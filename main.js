const { app, BrowserWindow ,ipcMain,Tray,Menu} = require('electron')
const Chroma = require("razer-chroma-nodejs");
const path = require('path');
const storage = require('electron-localstorage');
const fs = require('fs');
const { start } = require('repl');
//require("./trem-core/index.js")
const isDevelopment = process.env.NODE_ENV !== "production";
let setting_win = null;
let win =  null;
/*Chroma.util.init(() => {
  console.log("Chroma Editing Started");

  // Set the mouse color to green
  Chroma.effects.headset.setColor(Chroma.colors.RED);

  // Close Chroma after 5 seconds
  setTimeout(() => {
    Chroma.util.close(() => {
      console.log("Chroma Editing Stopped");
    });
  }, 5000);
});*/
if (!fs.existsSync(path.join(__dirname, '../../../../RF-Monitor_config/'))){
  fs.mkdirSync(path.join(__dirname, '../../../../RF-Monitor_config/'));
}
storage.setStoragePath(path.join(__dirname, '../../../../RF-Monitor_config/config.json'));
console.log(storage.getStoragePath());

if(storage.getItem('server_url')  == ""){
  storage.setItem('server_url','http://RFEQSERVER.myqnapcloud.com')
}
if(storage.getItem('ws_server_url')  == ""){
  storage.setItem('ws_server_url','ws://RFEQSERVER.myqnapcloud.com')
}
console.log(storage.getItem('server_url'));
if(storage.getItem('enable_gpu')  == ""){
  storage.setItem('enable_gpu',true)
}
if(storage.getItem('userlat')  == ""){
  storage.setItem('userlat',"25.033319")
}
if(storage.getItem('userlon')  == ""){
  storage.setItem('userlon',"121.564306")
}
if(storage.getItem('enable_autolaunch')  == ""){
  storage.setItem('enable_autolaunch',true)
}
if(storage.getItem('enable_window_popup')  == ""){
  storage.setItem('enable_window_popup',true)
}
if(storage.getItem('enable_weather')  == ""){
  storage.setItem('enable_weather',true)
}
if(storage.getItem('enable_typhoon')  === null){
  storage.setItem('enable_typhoon',true)
}
if(storage.getItem('enable_ty_analysis')  == ""){
  storage.setItem('enable_ty_analysis',true)
}
if(storage.getItem('enable_tsunami')  == ""){
  storage.setItem('enable_tsunami',true)
}
if(storage.getItem('enable_shindo')   == ""){
  storage.setItem('enable_shindo',true)
}
if(storage.getItem('PGA_warn_only')   == ""){
  storage.setItem('PGA_warn_only',true)
}
console.log(storage.getItem('PGA_warn_only'));

if(storage.getItem('enable_warningArea')   == ""){
  storage.setItem('enable_warningArea',true)
}
if(storage.getItem('local_only')   == ""){
  storage.setItem('local_only',"false")
}
if(storage.getItem('enable_wave')   == ""){
  storage.setItem('enable_wave',"false")
}
if(storage.getItem('enable_notification')  == ""){
  storage.setItem('enable_notification',true)
}
/////////音效
if(storage.getItem('enable_jp_eew_sound')  == ""){
  storage.setItem('enable_jp_eew_sound',"false")
}
if(storage.getItem('enable_tw_eew_sound')  == ""){
  storage.setItem('enable_tw_eew_sound',true)
}
if(storage.getItem('enable_eew_tw_read')  == ""){
  storage.setItem('enable_eew_tw_read',true)
}
if(storage.getItem('enable_shindo_sounds_1')  == ""){
  storage.setItem('enable_shindo_sounds_1',true)
}
if(storage.getItem('enable_shindo_sounds_2')  == ""){
  storage.setItem('enable_shindo_sounds_2',true)
}
if(storage.getItem('enable_shindo_sounds_3')  == ""){
  storage.setItem('enable_shindo_sounds_3',true)
}
if(storage.getItem('enable_shindo_sounds_4')  == ""){
  storage.setItem('enable_shindo_sounds_4',true)
}
if(storage.getItem('enable_shindo_sounds_5-')  == ""){
  storage.setItem('enable_shindo_sounds_5-',true)
}
if(storage.getItem('enable_shindo_sounds_5+') == ""){
  storage.setItem('enable_shindo_sounds_5+',true)
}
if(storage.getItem('enable_shindo_sounds_6-') == ""){
  storage.setItem('enable_shindo_sounds_6-',true)
}
if(storage.getItem('enable_shindo_sounds_6+') == ""){
  storage.setItem('enable_shindo_sounds_6+',true)
}
if(storage.getItem('enable_shindo_sounds_7') == ""){
  storage.setItem('enable_shindo_sounds_7',true)
}
/////////

if(storage.getItem('shindo_mode')  == ""){
  storage.setItem('shindo_mode',"shindo")
}
if(storage.getItem('enable_shindo_TREM')  == ""){
  storage.setItem('enable_shindo_TREM',true)
}
if(storage.getItem('enable_eew_jp')  == ""){
  storage.setItem('enable_eew_jp',true)
}
if(storage.getItem('enable_eew_tw')  == ""){
  storage.setItem('enable_eew_tw',true)
}
if(storage.getItem('enable_RFPLUS')  == ""){
  storage.setItem('enable_RFPLUS',"false")
}

if(storage.getItem('opacity')  == ""){
  storage.setItem('opacity',0.7)
}

if(storage.getItem('minimize_to_tray') == ""){
  storage.setItem("minimize_to_tray",'false')
}


if(storage.getItem('enable_gpu') == "false"){
  app.disableHardwareAcceleration()
}
if(storage.getItem('enable_autolaunch') != "false" || !isDevelopment){
  app.setLoginItemSettings({openAtLogin:true}); 
}else{
  app.setLoginItemSettings({openAtLogin:false});
}

if(storage.getItem('webhook_url_shindo_sokuho')  == ""){
  storage.setItem('webhook_url_shindo_sokuho','')
}
if(storage.getItem('webhook_header_shindo_sokuho')  == ""){
  storage.setItem('webhook_header_shindo_sokuho','RF震度速報')
}
if(storage.getItem('webhook_url_TW_EEW')  == ""){
  storage.setItem('webhook_url_TW_EEW','')
}
/*
if(storage.getItem('webhook_text_shindo_sokuho')  == ""){
  storage.setItem('webhook_text_shindo_sokuho','')
}
*/
if(storage.getItem('webhook_text_TW_EEW')  == ""){
  storage.setItem('webhook_text_TW_EEW','%T發生有感地震 第%N報 規模:M%M 最大震度:%I')
}
/* %N = 第N報
   %T = 時間
   %L = 震央
   %M = 規模
   %D = 深度
   %I = 最大震度
   %LAT = lat
   %LON = lon
*/
if(storage.getItem('selected_station')  == ""){
  storage.setItem('selected_station',"")
}
//波型測站
if(storage.getItem('Canvas1Sta')  == ""){
  storage.setItem('Canvas1Sta',"6050_0021")
}
if(storage.getItem('Canvas2Sta')  == ""){
  storage.setItem('Canvas2Sta',"6050_0011")
}
if(storage.getItem('Canvas3Sta')  == ""){
  storage.setItem('Canvas3Sta',"6050_0007")
}
if(storage.getItem('Canvas4Sta')  == ""){
  storage.setItem('Canvas4Sta',"6050_0003")
}
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