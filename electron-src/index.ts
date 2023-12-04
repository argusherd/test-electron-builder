import { app, BrowserWindow } from "electron";
import isDev from "electron-is-dev";
import prepareNext from "electron-next";
import serve from "electron-serve";
import path, { join } from "path";

const loadUrl = serve({
  directory: join(isDev ? process.cwd() : app.getAppPath(), "./renderer/out"),
});

app.on("ready", async () => {
  await prepareNext("./renderer");

  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  const url = isDev;

  if (isDev) {
    mainWindow.webContents.openDevTools();
    mainWindow.loadURL("http://localhost:8000/");
  } else {
    await loadUrl(mainWindow);
  }
});

app.on("window-all-closed", app.quit);
