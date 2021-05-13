const { remote, contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld('main',{
  close: () => ipcRenderer.send("close"),
  minimize: () => ipcRenderer.send("minimize")
});
