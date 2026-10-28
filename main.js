// GlycoNour (Windows) - version diagnostic : affiche les erreurs et permet F12.
const { app, BrowserWindow, Menu, session, dialog } = require("electron");
const path = require("path");

// Évite les fenêtres blanches liées au pilote graphique de certains PC.
app.disableHardwareAcceleration();

function createWindow() {
  const win = new BrowserWindow({
    width: 480,
    height: 860,
    minWidth: 340,
    minHeight: 560,
    title: "GlycoNour",
    backgroundColor: "#f4f8fc",
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      devTools: true,
    },
  });

  const file = path.join(__dirname, "index.html");

  win.webContents.on("did-fail-load", (_e, code, desc, url) => {
    dialog.showErrorBox("GlycoNour - erreur de chargement", `${desc} (${code})\n${url}`);
  });
  win.webContents.on("render-process-gone", (_e, details) => {
    dialog.showErrorBox("GlycoNour - erreur", `Le rendu s'est arrêté : ${details.reason}`);
  });
  // F12 ou Ctrl+Maj+I : ouvre la console pour voir les erreurs.
  win.webContents.on("before-input-event", (_e, input) => {
    const ctrlShiftI = input.control && input.shift && String(input.key).toLowerCase() === "i";
    if (input.type === "keyDown" && (input.key === "F12" || ctrlShiftI)) {
      win.webContents.toggleDevTools();
    }
  });

  win.loadFile(file).catch((err) => {
    dialog.showErrorBox("GlycoNour - fichier introuvable", `${String(err)}\n${file}`);
  });
  win.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  win.webContents.on("will-navigate", (e, url) => {
    if (!url.startsWith("file://")) e.preventDefault();
  });
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  session.defaultSession.webRequest.onBeforeRequest(
    { urls: ["http://*/*", "https://*/*", "ws://*/*", "wss://*/*"] },
    (_details, callback) => callback({ cancel: true })
  );
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
