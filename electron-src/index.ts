import { app, BrowserWindow, dialog, Menu } from "electron";
import isDev from "electron-is-dev";
import prepareNext from "electron-next";
import serve from "electron-serve";
import { autoUpdater } from "electron-updater";
import path, { join } from "path";

const loadUrl = serve({
  directory: join(isDev ? process.cwd() : app.getAppPath(), "./renderer/out"),
});

autoUpdater.autoDownload = false;

if (isDev) {
  autoUpdater.updateConfigPath = join(process.cwd(), "dev-app-update.yml");
  autoUpdater.forceDevUpdateConfig = true;
}

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

  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      {
        label: "Check update",
        click: () => autoUpdater.checkForUpdates(),
      },
    ]),
  );

  const url = isDev;

  if (isDev) {
    mainWindow.webContents.openDevTools();
    mainWindow.loadURL("http://localhost:8000/");
  } else {
    await loadUrl(mainWindow);
  }
});

app.on("window-all-closed", app.quit);

autoUpdater.on("update-available", () => {
  dialog
    .showMessageBox({
      type: "question",
      message: "There is a newer version. Do you want to update?",
      buttons: ["Yes", "No"],
    })
    .then(({ response }) => {
      if (response === 0) autoUpdater.downloadUpdate();
    });
});

autoUpdater.on("update-not-available", () => {
  dialog.showMessageBox({
    type: "info",
    message: "You are in the latest version.",
  });
});

autoUpdater.on("error", (error) => {
  dialog.showErrorBox("There is an error while updating", error.message);
});

autoUpdater.on("download-progress", (progress) => {
  console.log(progress);
});

autoUpdater.on("update-downloaded", () => {
  dialog
    .showMessageBox({
      type: "info",
      message: "Updated version downloaded.",
    })
    .then(() => {
      setImmediate(() => autoUpdater.quitAndInstall());
    });
});
