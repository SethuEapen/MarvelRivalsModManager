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


// Handle a request to open a "select folder" dialog and return the chosen path
ipcMain.handle('move-mod', async (event, file, checked, modDirPath, gameDirPath) => {
  try {
    // Example: the file is in a "mods" folder next to your Electron files
    // If `file` is already an absolute path, skip the path.join(...) part.
    const sourcePath = path.join(modDirPath, file);

    // Destination path where the mod should go in the game directory
    const destPath = path.join(gameDirPath, file);

    if (checked) {
      // Copy the file into the gameDirPath if `checked` is true
      await fs.promises.copyFile(sourcePath, destPath);
      console.log(`Copied ${file} to ${gameDirPath}`);
    } else {
      // Delete the file from the game directory if `checked` is false
      // If it doesn't exist, handle the error gracefully
      await fs.promises.unlink(destPath);
      console.log(`Deleted ${file} from ${gameDirPath}`);
    }

    // Return some success result if you want
    return { success: true };
  } catch (error) {
    console.error('Error in move-mod handler:', error);
    // Return an error result to the renderer (or throw)
    return { success: false, message: error.message };
  }
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
