import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Store from 'electron-store';
// 使用动态导入来处理 music-metadata
import * as mm from 'music-metadata';

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建存储实例
const store = new Store({
    name: 'music-player-settings',
    defaults: {
        settings: {
            musicFolder: '',
            scanSubfolders: true,
            supportedFormats: ['mp3', 'flac', 'wav'],
            autoPlay: false,
            defaultVolume: 50,
            rememberPlaybackPosition: true
        },
        recentlyPlayed: []
    }
});

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'src/main/preload.js')
        }
    });

    // 设置内容安全策略
    // ...existing code...

    // 尝试从Vite开发服务器加载
    const viteDevServerUrl = 'http://localhost:5173/';

    console.log('正在尝试连接到Vite开发服务器:', viteDevServerUrl);

    mainWindow.loadURL(viteDevServerUrl)
        .then(() => {
            console.log('成功连接到Vite开发服务器');
            mainWindow.webContents.openDevTools();
        })
        .catch((err) => {
            console.error('无法连接到Vite开发服务器:', err);
        });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// 设置IPC处理程序
function setupIpcHandlers() {
    // 选择音乐文件
    ipcMain.handle('select-music-files', async () => {
        // ...existing code...
    });

    // 选择文件夹
    ipcMain.handle('select-folder', async () => {
        // ...existing code...
    });

    // 获取设置
    ipcMain.handle('get-settings', () => {
        // ...existing code...
    });

    // 保存设置
    ipcMain.handle('save-settings', (_, settings) => {
        // ...existing code...
    });

    // 添加新的处理程序用于提取音频元数据
    ipcMain.handle('get-audio-metadata', async (_, filePath) => {
        try {
            if (!fs.existsSync(filePath)) {
                return { error: '文件不存在' };
            }

            const metadata = await mm.parseFile(filePath);

            // 提取关键信息
            const result = {
                title: metadata.common.title || path.basename(filePath),
                artist: metadata.common.artist || '未知艺术家',
                album: metadata.common.album || '未知专辑',
                duration: metadata.format.duration || 0,
                cover: null
            };

            // 提取封面图片（如果有）
            if (metadata.common.picture && metadata.common.picture.length > 0) {
                const picture = metadata.common.picture[0];
                result.cover = `data:${picture.format};base64,${picture.data.toString('base64')}`;
            }

            return result;
        } catch (error) {
            console.error('提取音频元数据时出错:', error);
            return { error: error.message };
        }
    });
}

app.whenReady().then(() => {
    createWindow();
    setupIpcHandlers();
});

// ...existing code...