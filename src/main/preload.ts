import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  selectFolder: () => ipcRenderer.invoke("select-folder"),
  saveFileDialog: (defaultName: string) => ipcRenderer.invoke("save-file-dialog", defaultName),
  openFileDialog: (filters?: { name: string; extensions: string[] }[]) => ipcRenderer.invoke("open-file-dialog", filters),
  writeFile: (filePath: string, data: Uint8Array | string) => ipcRenderer.invoke("write-file", filePath, data),
  readFile: (filePath: string) => ipcRenderer.invoke("read-file", filePath),
  getUserDataPath: () => ipcRenderer.invoke("get-user-data-path"),
  openFile: (filePath: string) => ipcRenderer.invoke("open-file", filePath)
});
