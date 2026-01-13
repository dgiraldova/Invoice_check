import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  selectFolder: () => ipcRenderer.invoke("select-folder"),
  saveFileDialog: (defaultName: string) => ipcRenderer.invoke("save-file-dialog", defaultName),
  writeFile: (filePath: string, data: Uint8Array | string) => ipcRenderer.invoke("write-file", filePath, data),
  openFile: (filePath: string) => ipcRenderer.invoke("open-file", filePath)
});
