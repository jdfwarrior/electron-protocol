const { app, BrowserWindow, protocol } = require("electron");
const fs = require("fs");
const path = require("path");

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // and load the index.html of the app.
  win.loadFile("index.html");

  // Open the DevTools.
  win.webContents.openDevTools();
}

// this function will handle requests for two file types, .json and .terrain
// it is assumed that those are the only two types that will be requested in this
function registerTerrainProtocol() {
  protocol.registerStreamProtocol("terrain", (request, callback) => {
    let pathTo = request.url.replace("terrain:/", "");
    pathTo = path.resolve(path.join(".", "terrain", pathTo));

    const isTerrain = pathTo.includes(".terrain");

    const headers = {
      "Content-Type": isTerrain
        ? "application/octet-stream"
        : "application/json",
      "Content-Encoding": isTerrain ? "gzip" : null,
    };

    callback({
      statusCode: 200,
      headers,
      data: fs.createReadStream(pathTo),
    });
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(registerTerrainProtocol).then(createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
