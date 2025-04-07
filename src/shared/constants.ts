/**
 * 定义应用程序中使用的常量
 */
import { PlayerState } from '../renderer/types';

// 重新导出 PlayerState，这样其他文件可以从constants中导入
export { PlayerState };

// IPC 通信通道
export const IPC_CHANNELS = {
  // 选择音乐文件
  SELECT_MUSIC_FILES: 'select-music-files',
  // 读取音频文件
  READ_AUDIO_FILE: 'read-audio-file',
  // 获取音频元数据
  GET_AUDIO_METADATA: 'get-audio-metadata',
  // 扫描音乐文件夹
  SCAN_MUSIC_FOLDER: 'scan-music-folder',
  // 获取应用配置
  GET_APP_CONFIG: 'get-app-config',
  // 保存应用配置
  SAVE_APP_CONFIG: 'save-app-config',
  READ_DIRECTORY: 'read-directory',
  PYTHON_ANALYZE: 'python-analyze',
  SELECT_FOLDER: 'select-folder',
  STORE_GET_SETTINGS: 'store-get-settings',
  STORE_SAVE_SETTINGS: 'store-save-settings',
  STORE_UPDATE_RECENTLY_PLAYED: 'store-update-recently-played',
  STORE_GET_RECENTLY_PLAYED: 'store-get-recently-played'
} as const;  // 使用 as const 确保类型更精确

// 支持的音频格式
export const SUPPORTED_AUDIO_FORMATS = [
  'mp3', 'wav', 'ogg', 'flac', 'm4a', '.aac'
] as const;  // 使用 as const 确保类型更精确

// 应用中使用的路由常量
export const ROUTES = {
  LIBRARY: '/library',
  PLAYER: '/player',
  SETTINGS: '/settings',
  HOME: '/'
};

// 应用中使用的事件名称
export const EVENTS = {
  PLAY: 'play',
  PAUSE: 'pause',
  NEXT: 'next',
  PREVIOUS: 'previous',
  SEEK: 'seek',
  VOLUME_CHANGE: 'volume-change',
  TOGGLE_REPEAT: 'toggle-repeat',
  TOGGLE_SHUFFLE: 'toggle-shuffle',
}

// 本地存储键名
export const STORAGE_KEYS = {
  VOLUME: 'player_volume',
  LAST_PLAYED: 'last_played_track',
  PLAYLISTS: 'user_playlists',
  SETTINGS: 'user_settings',
}

// 默认应用设置
export const DEFAULT_SETTINGS = {
  theme: 'light',
  audioQuality: 'high',
  autoPlay: false,
  language: 'zh-CN',
}