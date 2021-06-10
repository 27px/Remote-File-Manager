const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld('main',{
  close: () => ipcRenderer.send("close"),
  minimize: () => ipcRenderer.send("minimize"),
  maximize: () => ipcRenderer.send("maximize")
});

ipcRenderer.on('USED_PORT', function (event,USED_PORT) {
  localStorage.setItem('USED_PORT', USED_PORT);
});
