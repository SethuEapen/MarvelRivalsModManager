const { contextBridge, ipcRenderer } = require('electron');

/**
 * The contextBridge safely exposes an API to the renderer.
 * We define a function listPakFiles which calls the main process to get .pak files.
 */
contextBridge.exposeInMainWorld('electronAPI', {
  listPakFiles: (dirPath) => ipcRenderer.invoke('list-pak-files', dirPath),
  selectDirectory: (currPath) => ipcRenderer.invoke('select-directory', currPath)
});
