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
    onRFPLUS2: (cb) =>{
        console.log("[preload] sending RFPLUS");
        ipcRenderer.on('event:rfplus:2', (_, d) => cb(d))
    },
    onRFPLUS3: (cb) =>{
        console.log("[preload] sending RFPLUS");
        ipcRenderer.on('event:rfplus:3', (_, d) => cb(d))
    },
    onTsunami: (cb) => {
      ipcRenderer.on('event:tsunami', (_, d) => cb(d))
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
    getAll: () => ipcRenderer.invoke('config:getAll'),
    get: (key) => {
      return ipcRenderer.invoke('config:get', key)
    },
    set: (key, value) => {
      console.log("[preload] setting config",key ,value)
      return ipcRenderer.invoke('config:set', key, value)
    }
});

contextBridge.exposeInMainWorld('eq', {
    getInfoDistribution: (id) => ipcRenderer.invoke('eq:reportDistribution',id)
});

contextBridge.exposeInMainWorld('time', {
  sync: () => ipcRenderer.invoke('time:sync'),
  getOffset: () => ipcRenderer.invoke('time:getOffset'),
  now: () => ipcRenderer.invoke('time:now'),

  onOffsetChanged: (cb) =>
    ipcRenderer.on('time:offsetChanged', (_, offset) => cb(offset))
});

contextBridge.exposeInMainWorld('auth', {
  onStatus: (cb) =>{
        console.log("[preload] auth status updated");
        ipcRenderer.on('state:auth:status', (_, d) => cb(d))
    },
  setVerifyKey: (key) =>
    ipcRenderer.invoke('auth:setVerifyKey', key),
  login: (username, password) => 
    ipcRenderer.invoke('auth:login', username, password),
  onResult: (cb) =>{
    console.log("[preload] login finished")
    ipcRenderer.on('state:auth:result', (_, d) => cb(d))
  },
  logout: () => {
    ipcRenderer.invoke('auth:logout');
  }
    
});

contextBridge.exposeInMainWorld('windowControl', {
  showSetting: () =>
    ipcRenderer.send('showSetting'),

  showAnnouncement: () =>
    ipcRenderer.send('showAnnouncement')
});
