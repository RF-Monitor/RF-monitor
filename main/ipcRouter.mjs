import { BrowserWindow } from 'electron';

export function broadcastEvent(channel, payload) {
  BrowserWindow.getAllWindows().forEach(win =>{
    win.webContents.send(channel, payload)
    //console.log("[ipcbroadcast]sending via",channel)
  });
}

export function broadcastState(channel, payload) {
  BrowserWindow.getAllWindows().forEach(win =>
    win.webContents.send(`state:${channel}`, payload)
  );
}
