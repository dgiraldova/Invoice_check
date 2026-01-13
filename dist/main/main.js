"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const node_path_1 = __importDefault(require("node:path"));
const promises_1 = __importDefault(require("node:fs/promises"));
const isDev = !!process.env.VITE_DEV_SERVER_URL;
const createWindow = () => {
    const mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 820,
        minWidth: 980,
        minHeight: 720,
        backgroundColor: "#0f1216",
        webPreferences: {
            preload: node_path_1.default.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false
        }
    });
    if (isDev && process.env.VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    }
    else {
        mainWindow.loadFile(node_path_1.default.join(__dirname, "../../dist/index.html"));
    }
};
electron_1.app.whenReady().then(() => {
    createWindow();
    electron_1.app.on("activate", () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
electron_1.ipcMain.handle("select-folder", async () => {
    const result = await electron_1.dialog.showOpenDialog({
        properties: ["openDirectory"]
    });
    if (result.canceled || result.filePaths.length === 0) {
        return null;
    }
    return result.filePaths[0];
});
electron_1.ipcMain.handle("save-file-dialog", async (_event, defaultName) => {
    const result = await electron_1.dialog.showSaveDialog({
        defaultPath: defaultName
    });
    if (result.canceled || !result.filePath) {
        return null;
    }
    return result.filePath;
});
electron_1.ipcMain.handle("write-file", async (_event, filePath, data) => {
    await promises_1.default.writeFile(filePath, data);
    return true;
});
electron_1.ipcMain.handle("open-file", async (_event, filePath) => {
    return { ok: true, path: filePath };
});
