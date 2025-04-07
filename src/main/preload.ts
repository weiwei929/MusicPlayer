import { contextBridge, ipcRenderer } from 'electron';
import * as path from 'path';

// 暴露安全的 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
    // 对话框
    openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
    openFile: () => ipcRenderer.invoke('dialog:openFile'),

    // 窗口控制
    minimizeWindow: () => ipcRenderer.send('window:minimize'),
    maximizeWindow: () => ipcRenderer.send('window:maximize'),
    closeWindow: () => ipcRenderer.send('window:close'),

    // 音乐文件
    scanMusicDirectory: (directory) => ipcRenderer.invoke('music:scanDirectory', directory),
    selectMusicFiles: () => ipcRenderer.invoke('select-music-files'),

    // 配置
    saveConfig: (key, value) => ipcRenderer.invoke('config:save', key, value),
    loadConfig: (key) => ipcRenderer.invoke('config:load', key),

    // 设置相关
    getSettings: () => ipcRenderer.invoke('store:get-settings'),
    saveSettings: (settings) => ipcRenderer.invoke('store:save-settings', settings),
    selectFolder: () => ipcRenderer.invoke('dialog:select-folder'),

    // 最近播放
    updateRecentlyPlayed: (song) => ipcRenderer.invoke('store:update-recently-played', song),
    getRecentlyPlayed: () => ipcRenderer.invoke('store:get-recently-played'),

    // 路径工具函数
    path: {
        join: (...args: string[]) => path.join(...args),
        dirname: (p: string) => path.dirname(p),
        basename: (p: string) => path.basename(p),
        extname: (p: string) => path.extname(p)
    }
});