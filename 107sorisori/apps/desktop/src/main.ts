import path from "node:path";

import { app, BrowserWindow, ipcMain } from "electron";

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true";

function createWindow() {
  const preload = path.join(__dirname, "preload.js");
  const rendererHtml = path.join(__dirname, "renderer", "index.html");

  const win = new BrowserWindow({
    width: 980,
    height: 720,
    webPreferences: {
      preload,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile(rendererHtml);
}

app.whenReady().then(() => {
  ipcMain.handle("sorisori:getDefaults", () => ({
    wsUrl: process.env.DESKTOP_WS_URL ?? "ws://127.0.0.1:8787/ws",
    sessionId:
      process.env.DESKTOP_SESSION_ID ?? process.env.DEFAULT_SESSION_ID ?? "mvp-session-001",
    sampleRate: Number(process.env.DESKTOP_SAMPLE_RATE ?? "48000"),
  }));

  createWindow();
});
