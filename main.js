const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // Ensure preload is enabled to communicate with the renderer safely.
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadFile('index.html');
}

// Handle a request to list .pak files in a given directory
ipcMain.handle('list-pak-files', (event, dirPath) => {
  try {
    const files = fs.readdirSync(dirPath, { withFileTypes: true });
    // Filter for files that have .pak extension
    const pakFiles = files
      .filter((dirent) => dirent.isFile() && path.extname(dirent.name) === '.pak')
      .map((dirent) => dirent.name);

    return pakFiles;
  } catch (error) {
    console.error('Error reading directory:', error);
    return [];
  }
});

// Handle a request to open a "select folder" dialog and return the chosen path
ipcMain.handle('select-directory', async (event, currPath) => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    defaultPath: currPath
  });
  
  if (canceled || filePaths.length === 0) {
    return null; 
  }
  return filePaths[0];
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// const { app, BrowserWindow } = require('electron')

// const createWindow = () => {
//   const win = new BrowserWindow({
//     width: 800,
//     height: 600
//   })

//   win.loadFile('index.html')
// }

// app.whenReady().then(() => {
//   createWindow()
// })

// app.on('window-all-closed', () => {
//     if (process.platform !== 'darwin') app.quit()
//   })