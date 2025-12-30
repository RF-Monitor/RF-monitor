const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ws', {
    onStatus: (cb) =>{
        console.log("[preload] status updated");
        ipcRenderer.on('state:ws:status', (_, d) => cb(d))
    },
    onPGA: (cb) =>{
        console.log("[preload] sending PGA");
        ipcRenderer.on('event:pga', (_, d) => cb(d))
    },
    onEEWTW: (cb) =>{
        console.log("[preload] sending EEWTW");
        ipcRenderer.on('event:eew:tw', (_, d) => cb(d))
    },
  
    onWeather: (cb) =>{
        console.log("[preload] sending Weather");
        ipcRenderer.on('event:weather:alert', (_, d) => cb(d));
    },
    
    onReport: (cb) => {
        console.log("[preload] sending report")
        ipcRenderer.on('event:eq:report', (_, d) => cb(d))
    }
        
});

contextBridge.exposeInMainWorld('config', {
    getAll: () => ipcRenderer.invoke('config:getAll')
});

contextBridge.exposeInMainWorld('time', {
  sync: () => ipcRenderer.invoke('time:sync'),
  getOffset: () => ipcRenderer.invoke('time:getOffset'),
  now: () => ipcRenderer.invoke('time:now'),

  onOffsetChanged: (cb) =>
    ipcRenderer.on('time:offsetChanged', (_, offset) => cb(offset))
});

contextBridge.exposeInMainWorld('auth', {
  setVerifyKey: (key) =>
    ipcRenderer.invoke('auth:setVerifyKey', key),

  onResult: (cb) =>
    ipcRenderer.on('state:auth:result', (_, d) => cb(d))
});
