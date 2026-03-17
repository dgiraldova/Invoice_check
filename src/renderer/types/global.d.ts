export {};

declare global {
  interface Window {
    electronAPI: {
      selectFolder: () => Promise<string | null>;
      saveFileDialog: (defaultName: string) => Promise<string | null>;
      openFileDialog: (filters?: { name: string; extensions: string[] }[]) => Promise<string | null>;
      writeFile: (filePath: string, data: Uint8Array | string) => Promise<boolean>;
      readFile: (filePath: string) => Promise<string>;
      getUserDataPath: () => Promise<string>;
      openFile: (filePath: string) => Promise<{ ok: boolean; path: string }>;
    };
  }
}
