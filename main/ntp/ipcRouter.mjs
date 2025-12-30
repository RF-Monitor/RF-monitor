import { ipcMain, BrowserWindow } from 'electron';
import { syncNTP, getNtpOffset, now } from './ntp.mjs';

export function registerTimeIPC() {

  ipcMain.handle('time:sync', async () => {
    const offset = await syncNTP();
    broadcastOffset(offset);
    return offset;
  });

  ipcMain.handle('time:getOffset', () => {
    return getNtpOffset();
  });

  ipcMain.handle('time:now', () => {
    return now();
  });
}

function broadcastOffset(offset) {
  BrowserWindow.getAllWindows().forEach(win => {
    win.webContents.send('time:offsetChanged', offset);
  });
}
