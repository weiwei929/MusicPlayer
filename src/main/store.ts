import Store from 'electron-store';
import { ipcMain } from 'electron';

// 定义设置的类型
interface ISettings {
    audioDevice: string;
    autoPlay: boolean;
    defaultVolume: number;
    rememberVolume: boolean;
    theme: 'light' | 'dark' | 'system';
    startupView: 'library' | 'player' | 'last';
    musicFolder: string;
    scanSubfolders: boolean;
    supportedFormats: string[];
}

// 创建默认设置
const defaultSettings: ISettings = {
    audioDevice: 'default',
    autoPlay: false,
    defaultVolume: 50,
    rememberVolume: true,
    theme: 'light',
    startupView: 'library',
    musicFolder: '',
    scanSubfolders: true,
    supportedFormats: ['mp3', 'flac', 'wav']
};

// 创建存储实例
const store = new Store({
    name: 'music-player-settings',
    defaults: {
        settings: defaultSettings,
        recentlyPlayed: [],
        playlists: []
    }
});

// 设置IPC处理程序
export function setupStoreHandlers() {
    // 获取设置
    ipcMain.handle('store:get-settings', () => {
        return store.get('settings');
    });

    // 保存设置
    ipcMain.handle('store:save-settings', (_, settings: ISettings) => {
        store.set('settings', settings);
        return true;
    });

    // 更新最近播放的歌曲
    ipcMain.handle('store:update-recently-played', (_, song) => {
        const recent = store.get('recentlyPlayed') as any[];
        // 移除相同的歌曲（如果存在）
        const filtered = recent.filter(item => item.id !== song.id);
        // 添加到开头
        filtered.unshift(song);
        // 只保留最近的20首
        const limited = filtered.slice(0, 20);
        store.set('recentlyPlayed', limited);
        return limited;
    });

    // 获取最近播放的歌曲
    ipcMain.handle('store:get-recently-played', () => {
        return store.get('recentlyPlayed');
    });
}

export default store;
