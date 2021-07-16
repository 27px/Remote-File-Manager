//global
USED_PORT = 0; // port will be assigned

const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
const expressApp = require(path.join(__dirname, "server", "index.js"));
const url = require("url");

let win;

function createWindow() {
  // express server app
  USED_PORT = expressApp(0); // port as 0 so uses any free port

  // Create the browser window.
  win = new BrowserWindow({
    width: 600,
    height: 600,
    minWidth: 750,
    minHeight: 350,
    backgroundColor: "#FFFFFF",
    icon: path.join(__dirname, "dist", "icon.ico"),
    show: false,
    frame: false, // hide bar and make custom
    title: "File Manager",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.setMenu(null); // hide menu
  win.webContents.send("USED_PORT", USED_PORT);
  win.maximize();
  win.show();

  win.loadURL(
    url.format({
      pathname: path.join(__dirname, "dist", "index.html"),
      protocol: "file:",
      slashes: true,
    })
  );

  win.focus();

  //// DevTools. // remove in production
  // win.webContents.openDevTools()

  win.webContents.on("new-window", function (event, url) {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Event when the window is closed.
  win.on("closed", () => {
    win = null;
  });
}

// custom
ipcMain.on("close", () => {
  win.close();
});

ipcMain.on("minimize", () => {
  win.minimize();
});

ipcMain.on("maximize", () => {
  let xwin = BrowserWindow.getFocusedWindow();
  if (xwin.isMaximized()) {
    xwin.unmaximize();
  } else {
    xwin.maximize();
  }
});

// Create window on electron intialization
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS specific close process
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // macOS specific close process
  if (win === null) {
    createWindow();
  }
});
