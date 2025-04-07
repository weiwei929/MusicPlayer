import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import fs from 'fs'
import { IPC_CHANNELS } from '../src/shared/constants'
import type { AudioMetadata } from '../src/renderer/types'

// 禁用 Electron 安全警告
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

// 保存对主窗口的引用，避免被垃圾回收
let mainWindow: BrowserWindow | null = null

// 开发环境标志
const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * 创建主窗口
 */
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: join(__dirname, '../dist/electron/preload.js'),
      sandbox: false
    },
    show: false, // 初始化时隐藏窗口
    frame: true,
    titleBarStyle: 'default',
    title: 'Music Player'
  })

  // 加载应用
  if (isDevelopment) {
    // 开发环境下加载开发服务器地址
    mainWindow.loadURL('http://localhost:3000')
    // 开启开发者工具
    mainWindow.webContents.openDevTools()
  } else {
    // 生产环境下加载编译后的文件
    const indexHtml = join(__dirname, '../dist/renderer/index.html')
    mainWindow.loadFile(indexHtml)
  }

  // 当窗口准备好时显示
  mainWindow.on('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show()
    }
  })

  // 当窗口关闭时，取消引用
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// 当 Electron 初始化完成时创建窗口
app.whenReady().then(() => {
  createWindow()

  // 在 macOS 上，当所有窗口都关闭时重新创建窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })

  // 设置 IPC 处理器
  setupIpcHandlers()
})

// 当所有窗口关闭时退出应用（Windows & Linux）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

/**
 * 设置 IPC 通信处理器
 */
function setupIpcHandlers(): void {
  // 处理打开文件对话框请求
  ipcMain.handle(IPC_CHANNELS.SELECT_MUSIC_FILES, async () => {
    if (!mainWindow) return []

    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Audio Files', extensions: ['mp3', 'wav', 'ogg', 'flac', 'm4a'] }
      ]
    })

    if (result.canceled) {
      return []
    }

    return result.filePaths
  })

  // 处理读取音频文件请求
  ipcMain.handle(IPC_CHANNELS.READ_AUDIO_FILE, async (_, filePath: string) => {
    try {
      const buffer = fs.readFileSync(filePath)
      return buffer.toString('base64')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('Error reading audio file:', errorMessage)
      return null
    }
  })

  // 处理获取音频元数据请求
  ipcMain.handle(IPC_CHANNELS.GET_AUDIO_METADATA, async (_, filePath: string) => {
    try {
      // 从文件路径中提取文件名和扩展名
      const fullFileName = filePath.split(/[/\\]/).pop() || '';
      const fileName = fullFileName.replace(/\.[^.]+$/, '');
      
      // 创建符合 AudioMetadata 接口的对象
      const metadata: AudioMetadata = {
        title: fileName,
        path: filePath,
        // 添加可选字段的默认值
        artist: undefined,
        album: undefined,
        year: undefined,
        genre: undefined,
        duration: undefined,
        coverArt: undefined
      };
      
      return metadata;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('Error getting audio metadata:', errorMessage)
      return null
    }
  })
}

// 处理未捕获的异常
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught exception:', error)
})