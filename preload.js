const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  getDeviceInfo: () => ipcRenderer.invoke('get:deviceInfo'),
  sendUniqueDeviceID: (uniqueDeviceID, lang) => ipcRenderer.send('send-unique-device-id', uniqueDeviceID, lang),
   // 接收主进程的进度更新
   onRestoreProgress: (callback) => ipcRenderer.on('restore-progress', (event, progress) => callback(progress)),
})