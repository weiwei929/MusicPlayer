const { app, BrowserWindow, ipcMain, dialog, protocol } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');
// 使用 node-id3 替代 music-metadata
const NodeID3 = require('node-id3');

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

    // 设置更宽松的内容安全策略，允许从localhost加载媒体
    mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': [
                    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' http://localhost:* file: data: blob:;"
                ]
            }
        });
    });

    // 尝试加载Vite开发服务器
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

    // 设置IPC处理程序
    setupIpcHandlers();
}

// 设置IPC处理程序
function setupIpcHandlers() {
    // 移除所有现有处理程序，防止重复注册
    ipcMain.removeHandler('select-music-files');
    ipcMain.removeHandler('select-folder');
    ipcMain.removeHandler('get-settings');
    ipcMain.removeHandler('save-settings');
    ipcMain.removeHandler('get-audio-metadata');
    ipcMain.removeHandler('get-audio-file-url');
    ipcMain.removeHandler('save-user-data');
    ipcMain.removeHandler('get-user-data');

    // 选择音乐文件
    ipcMain.handle('select-music-files', async () => {
        try {
            const result = await dialog.showOpenDialog({
                properties: ['openFile', 'multiSelections'],
                filters: [
                    { name: 'Audio Files', extensions: ['mp3', 'wav', 'flac', 'aac', 'ogg'] }
                ]
            });

            if (result.canceled) {
                return { canceled: true, filePaths: [] };
            }

            return {
                canceled: false,
                filePaths: result.filePaths
            };
        } catch (error) {
            console.error('选择音乐文件时出错:', error);
            return { error: error.message, canceled: true, filePaths: [] };
        }
    });

    // 选择文件夹
    ipcMain.handle('select-folder', async () => {
        try {
            const result = await dialog.showOpenDialog({
                properties: ['openDirectory']
            });

            return result;
        } catch (error) {
            console.error('选择文件夹时出错:', error);
            return { error: error.message, canceled: true, filePaths: [] };
        }
    });

    // 获取设置
    ipcMain.handle('get-settings', () => {
        try {
            const settings = store.get('settings');
            return settings;
        } catch (error) {
            console.error('获取设置时出错:', error);
            return null;
        }
    });

    // 保存设置
    ipcMain.handle('save-settings', (_, settings) => {
        try {
            store.set('settings', settings);
            return { success: true };
        } catch (error) {
            console.error('保存设置时出错:', error);
            return { error: error.message };
        }
    });

    // 添加新的处理程序用于提取音频元数据
    ipcMain.handle('get-audio-metadata', async (_, filePath) => {
        try {
            if (!fs.existsSync(filePath)) {
                return { error: '文件不存在' };
            }

            // 使用 node-id3 读取标签
            const tags = NodeID3.read(filePath);

            // 提取关键信息
            const result = {
                title: tags.title || path.basename(filePath).replace(/\.[^/.]+$/, ""),
                artist: tags.artist || '未知艺术家',
                album: tags.album || '未知专辑',
                duration: 0, // node-id3 不直接提供持续时间
                cover: null
            };

            // 提取封面图片（如果有）
            if (tags.image && tags.image.imageBuffer) {
                const imageBuffer = tags.image.imageBuffer;
                const mimeType = tags.image.mime || 'image/jpeg';
                result.cover = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
            }

            return result;
        } catch (error) {
            console.error('提取音频元数据时出错:', error);
            return { error: error.message };
        }
    });

    // 添加处理程序以获取音频文件URL
    ipcMain.handle('get-audio-file-url', async (_, filePath) => {
        try {
            console.log(`尝试获取音频文件URL: ${filePath}`);

            if (!fs.existsSync(filePath)) {
                console.error(`文件不存在: ${filePath}`);
                return { error: '文件不存在' };
            }

            // 使用app.getPath('temp')创建一个临时目录
            const tempDir = path.join(app.getPath('temp'), 'music-player');
            console.log(`临时目录: ${tempDir}`);

            // 确保临时目录存在
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
                console.log(`创建临时目录: ${tempDir}`);
            }

            // 创建文件的唯一临时名称
            const fileName = path.basename(filePath);
            const uniqueId = Date.now().toString() + Math.round(Math.random() * 1000);
            const safeFileName = `${uniqueId}-${fileName}`;
            const tempFilePath = path.join(tempDir, safeFileName);

            console.log(`原始文件: ${filePath}`);
            console.log(`临时文件: ${tempFilePath}`);

            try {
                // 尝试直接复制文件
                fs.copyFileSync(filePath, tempFilePath);
                console.log(`文件直接复制成功: ${tempFilePath}`);
            } catch (copyError) {
                console.error(`直接复制文件失败: ${copyError.message}`);

                // 如果直接复制失败，尝试使用流复制
                try {
                    await new Promise((resolve, reject) => {
                        const readStream = fs.createReadStream(filePath);
                        const writeStream = fs.createWriteStream(tempFilePath);

                        readStream.on('error', (err) => {
                            console.error(`读取文件错误: ${filePath}`, err);
                            reject(err);
                        });

                        writeStream.on('error', (err) => {
                            console.error(`写入文件错误: ${tempFilePath}`, err);
                            reject(err);
                        });

                        writeStream.on('finish', () => {
                            console.log(`文件流复制完成: ${tempFilePath}`);
                            resolve();
                        });

                        readStream.pipe(writeStream);
                    });
                } catch (streamError) {
                    console.error(`流复制也失败: ${streamError.message}`);
                    return { error: `无法复制文件: ${streamError.message}` };
                }
            }

            // 验证临时文件是否存在
            if (!fs.existsSync(tempFilePath)) {
                console.error(`复制后临时文件不存在: ${tempFilePath}`);
                return { error: '创建临时文件失败' };
            }

            // 构造并返回文件URL
            const url = `http://localhost:3001/${encodeURIComponent(safeFileName)}`;
            console.log(`返回音频URL: ${url}`);
            return url;
        } catch (error) {
            console.error('创建音频文件URL时出错:', error);
            return { error: error.message };
        }
    });

    // 清理旧的临时文件
    function cleanupOldTempFiles(tempDir, exceptFileName) {
        try {
            const files = fs.readdirSync(tempDir);
            const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24小时前

            files.forEach(file => {
                if (file !== exceptFileName) {
                    const filePath = path.join(tempDir, file);
                    try {
                        const stats = fs.statSync(filePath);
                        // 删除24小时前创建的文件
                        if (stats.ctimeMs < cutoffTime) {
                            fs.unlinkSync(filePath);
                            console.log(`删除旧临时文件: ${filePath}`);
                        }
                    } catch (err) {
                        // 忽略错误，继续处理其他文件
                        console.warn(`无法检查或删除文件: ${filePath}`, err);
                    }
                }
            });
        } catch (error) {
            console.warn('清理旧临时文件时出错:', error);
        }
    }

    // 为播放功能添加文件协议处理
    protocol.registerFileProtocol('local', (request, callback) => {
        const url = request.url.substring(8);
        try {
            return callback(decodeURIComponent(url));
        } catch (error) {
            console.error(error);
            return callback('404');
        }
    });

    // 添加处理程序以保存用户数据
    ipcMain.handle('save-user-data', async (_, key, data) => {
        try {
            console.log(`保存用户数据: ${key}`);
            store.set(key, data);
            return { success: true };
        } catch (error) {
            console.error('保存用户数据时出错:', error);
            return { error: error.message };
        }
    });

    // 添加处理程序以获取用户数据
    ipcMain.handle('get-user-data', async (_, key) => {
        try {
            console.log(`获取用户数据: ${key}`);
            return store.get(key);
        } catch (error) {
            console.error('获取用户数据时出错:', error);
            return null;
        }
    });
}

// 创建HTTP服务器来提供音乐文件
function createMusicServer() {
    const http = require('http');
    const url = require('url');
    const mime = require('mime-types');

    const server = http.createServer((req, res) => {
        // 允许跨域请求
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');

        // 处理OPTIONS请求
        if (req.method === 'OPTIONS') {
            res.statusCode = 204;
            res.end();
            return;
        }

        const parsedUrl = url.parse(req.url);
        const fileName = decodeURIComponent(parsedUrl.pathname.substring(1));
        const filePath = path.join(app.getPath('temp'), 'music-player', fileName);

        // 记录请求信息
        console.log(`处理音乐文件请求: ${fileName}`);

        // 使用异步API检查文件是否存在
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                console.error(`文件不存在: ${filePath}`, err);
                res.statusCode = 404;
                res.end('File not found');
                return;
            }

            // 异步获取文件信息
            fs.stat(filePath, (statErr, stat) => {
                if (statErr) {
                    console.error(`获取文件信息失败: ${filePath}`, statErr);
                    res.statusCode = 500;
                    res.end('Internal Server Error');
                    return;
                }

                const fileSize = stat.size;
                const mimeType = mime.lookup(filePath) || 'audio/mpeg';

                console.log(`文件类型: ${mimeType}, 文件大小: ${fileSize}`);

                res.setHeader('Content-Type', mimeType);
                res.setHeader('Accept-Ranges', 'bytes');

                // 处理范围请求
                const range = req.headers.range;
                if (range) {
                    const parts = range.replace(/bytes=/, '').split('-');
                    const start = parseInt(parts[0], 10);
                    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

                    const chunksize = (end - start) + 1;
                    console.log(`范围请求: ${start}-${end}/${fileSize}`);

                    if (start >= fileSize || end >= fileSize) {
                        res.statusCode = 416;
                        res.setHeader('Content-Range', `bytes */${fileSize}`);
                        res.end();
                        return;
                    }

                    res.statusCode = 206;
                    res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
                    res.setHeader('Content-Length', chunksize);

                    const file = fs.createReadStream(filePath, { start, end });
                    file.on('error', (error) => {
                        console.error(`文件流错误: ${filePath}`, error);
                        // 如果响应头尚未发送，则发送错误响应
                        if (!res.headersSent) {
                            res.statusCode = 500;
                            res.end('Internal Server Error');
                        } else {
                            // 否则关闭连接
                            res.end();
                        }
                    });

                    file.pipe(res);
                } else {
                    res.setHeader('Content-Length', fileSize);
                    const fileStream = fs.createReadStream(filePath);

                    fileStream.on('error', (error) => {
                        console.error(`文件流错误: ${filePath}`, error);
                        // 如果响应头尚未发送，则发送错误响应
                        if (!res.headersSent) {
                            res.statusCode = 500;
                            res.end('Internal Server Error');
                        } else {
                            // 否则关闭连接
                            res.end();
                        }
                    });

                    fileStream.pipe(res);
                }
            });
        });
    });

    server.on('error', (error) => {
        console.error('音乐服务器错误:', error);
    });

    try {
        server.listen(3001, 'localhost', () => {
            console.log('音乐服务器运行在 http://localhost:3001/');
        });
    } catch (error) {
        console.error('启动音乐服务器失败:', error);
    }

    return server;
}

let musicServer = null;

// 确保 setupIpcHandlers 只被调用一次
let handlersInitialized = false;

app.whenReady().then(() => {
    createWindow();

    // 防止重复初始化处理程序
    if (!handlersInitialized) {
        setupIpcHandlers();
        handlersInitialized = true;
    }

    // 启动音乐服务器
    musicServer = createMusicServer();
});

app.on('will-quit', () => {
    // 关闭音乐服务器
    if (musicServer) {
        musicServer.close();
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
