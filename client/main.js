const expressApp = require('../server/index');

const { app, BrowserWindow } = require('electron')

let win;

function createWindow () {
  expressApp();
  // Create the browser window.
  win = new BrowserWindow({
    width: 600,
    height: 600,
    backgroundColor: '#FFFFFF',
    icon: `file://${__dirname}/dist/favicon.ico`,
    show: false
  })

  win.setMenu(null) // hide menu
  win.maximize();
  win.show();

  // win.loadURL('http://localhost:5000/');// server
  // win.loadURL('http://localhost:4200/');// client
  win.loadURL(`file://${__dirname}/dist/index.html`)
  win.focus();



  //// uncomment below to open the DevTools.
  win.webContents.openDevTools()

  // Event when the window is closed.
  win.on('closed',()=>{
    win = null
  })
}

// Create window on electron intialization
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed',()=>{
  // On macOS specific close process
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // macOS specific close process
  if (win === null) {
    createWindow()
  }
})
