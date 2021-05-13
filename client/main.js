const expressApp = require('../server/index');

const { app, BrowserWindow, ipcMain, remote } = require('electron');
const path = require("path");
const url = require("url");

let win;

function createWindow()
{
  expressApp();
  // Create the browser window.
  win = new BrowserWindow({
    width: 600,
    height: 600,
    backgroundColor: '#FFFFFF',
    icon: path.join(__dirname, "dist", "favicon.ico"),
    show: false,
    frame: false, // hide bar and make custom
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  })

  win.setMenu(null) // hide menu
  win.maximize();
  win.show();

  win.loadURL(url.format({
    pathname:path.join(__dirname,"dist","index.html"),
    protocol:"file:",
    slashes:true
  }));

  win.focus();

  //// uncomment below to open the DevTools.
  win.webContents.openDevTools()

  // Event when the window is closed.
  win.on('closed',()=>{
    win = null
  })
}

// custom
ipcMain.on("close",()=>{
  win.close();
});

ipcMain.on("minimize",()=>{
  win.minimize();
});

// Create window on electron intialization
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed',()=>{
  // On macOS specific close process
  if(process.platform !== 'darwin')
  {
    app.quit()
  }
})

app.on('activate',()=>{
  // macOS specific close process
  if(win === null)
  {
    createWindow();
  }
})
