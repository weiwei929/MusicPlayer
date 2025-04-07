const { app, BrowserWindow } = require('electron');
const path = require('path');

// 创建窗口
function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    // 加载一个简单的HTML
    win.loadFile('test.html');

    // 打开开发者工具
    win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

console.log('Electron 版本:', process.versions.electron);
console.log('Node.js 版本:', process.versions.node);
console.log('Chrome 版本:', process.versions.chrome);
