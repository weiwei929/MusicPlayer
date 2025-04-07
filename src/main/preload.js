const { contextBridge, ipcRenderer } = require('electron');

console.log('预加载脚本正在执行');

// 暴露安全的API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
    // 测试连接
    testConnection: () => '连接成功',

    // 音乐文件选择
    selectMusicFiles: () => ipcRenderer.invoke('select-music-files'),

    // 文件夹选择
    selectFolder: () => ipcRenderer.invoke('select-folder'),

    // 设置管理
    getSettings: () => ipcRenderer.invoke('get-settings'),
    saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),

    // 音频元数据
    getAudioMetadata: (filePath) => ipcRenderer.invoke('get-audio-metadata', filePath),

    // 音频文件URL
    getAudioFileUrl: (filePath) => ipcRenderer.invoke('get-audio-file-url', filePath),

    // 用户数据存储
    saveUserData: (key, data) => ipcRenderer.invoke('save-user-data', key, data),
    getUserData: (key) => ipcRenderer.invoke('get-user-data', key)
});

console.log('预加载脚本已完成API暴露');
