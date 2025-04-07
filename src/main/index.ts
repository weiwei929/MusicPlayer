import { app, BrowserWindow, ipcMain, dialog, session } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { IPC_CHANNELS, SUPPORTED_AUDIO_FORMATS } from '../shared/constants';
// 修改导入方式
import * as mm from 'music-metadata';
import ElectronStore from 'electron-store';
import pythonBridge from './python-bridge';
import { setupStoreHandlers } from './store';
import { setupAudioMetadataHandlers } from './audio-metadata';

// 初始化配置存储
const store = new ElectronStore();

// 声明主窗口
let mainWindow: BrowserWindow | null = null;

// 创建主窗口
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        title: '音乐播放器',
        show: false
    });

    // 加载应用
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:5173/');
        // 打开开发工具
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../index.html'));
    }

    // 窗口准备好后显示，避免白屏
    mainWindow.on('ready-to-show', () => {
        mainWindow?.show();
    });

    // 窗口关闭时设置为null
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // 在创建窗口后设置内容安全策略
    mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': [
                    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' file: data: blob:;"
                ]
            }
        });
    });
}

// 当Electron完成初始化时创建窗口
app.whenReady().then(() => {
    createWindow();

    // 初始化 Python Bridge
    pythonBridge.init();

    // 初始化存储
    setupStoreHandlers();

    // 设置音频元数据处理程序
    setupAudioMetadataHandlers();

    // 添加选择文件夹的处理程序
    ipcMain.handle('dialog:select-folder', async () => {
        const result = await dialog.showOpenDialog({
            properties: ['openDirectory']
        });
        return result;
    });

    // 设置CSP
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': [
                    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' file: data: blob:;"
                ]
            }
        });
    });

    app.on('activate', () => {
        // 在macOS上，点击dock图标时重新创建窗口
        if (mainWindow === null) createWindow();
    });
});

app.on('will-quit', () => {
    // 关闭 Python 进程
    pythonBridge.shutdown();
});

// 当所有窗口关闭时退出应用
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// 处理IPC通信

// 选择音乐文件
ipcMain.handle(IPC_CHANNELS.SELECT_MUSIC_FILES, async () => {
    if (!mainWindow) return { success: false, error: '主窗口未初始化' };

    try {
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openFile', 'multiSelections'],
            filters: [
                { name: '音频文件', extensions: SUPPORTED_AUDIO_FORMATS.map(format => format) }
            ]
        });

        if (result.canceled) {
            return { success: true, data: [] };
        }

        return { success: true, data: result.filePaths };
    } catch (error) {
        console.error('选择音乐文件时出错:', error);
        return { success: false, error: `选择文件时出错: ${error}` };
    }
});

// 扫描音乐文件夹
ipcMain.handle(IPC_CHANNELS.SCAN_MUSIC_FOLDER, async () => {
    if (!mainWindow) return { success: false, error: '主窗口未初始化' };

    try {
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openDirectory'],
            title: '选择音乐文件夹'
        });

        if (result.canceled) {
            return { success: true, data: { files: [], folderPath: null } };
        }

        const folderPath = result.filePaths[0];
        const musicFiles = await scanFolder(folderPath);

        return {
            success: true,
            data: {
                files: musicFiles,
                folderPath: folderPath
            }
        };
    } catch (error) {
        console.error('扫描音乐文件夹时出错:', error);
        return { success: false, error: `扫描文件夹时出错: ${error}` };
    }
});

// 获取音频元数据
ipcMain.handle(IPC_CHANNELS.GET_AUDIO_METADATA, async (_, filePath: string) => {
    try {
        const metadata = await mm.parseFile(filePath);
        return { success: true, data: metadata };
    } catch (error) {
        console.error(`获取文件 ${filePath} 的元数据时出错:`, error);
        return { success: false, error: `获取元数据失败: ${error}` };
    }
});

// 辅助函数：扫描文件夹中的音频文件
async function scanFolder(folderPath: string): Promise<string[]> {
    const files: string[] = [];
    const supportedExtensions = SUPPORTED_AUDIO_FORMATS.map(ext => `.${ext}`);

    async function scan(dir: string) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                await scan(fullPath);
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();
                if (supportedExtensions.includes(ext)) {
                    files.push(fullPath);
                }
            }
        }
    }

    await scan(folderPath);
    return files;
}

export { createWindow };
