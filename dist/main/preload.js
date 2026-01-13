"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld("electronAPI", {
    selectFolder: () => electron_1.ipcRenderer.invoke("select-folder"),
    saveFileDialog: (defaultName) => electron_1.ipcRenderer.invoke("save-file-dialog", defaultName),
    writeFile: (filePath, data) => electron_1.ipcRenderer.invoke("write-file", filePath, data),
    openFile: (filePath) => electron_1.ipcRenderer.invoke("open-file", filePath)
});
