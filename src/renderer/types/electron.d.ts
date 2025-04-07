/**
 * Electron API 类型定义
 * 
 * 此文件为 TypeScript 类型声明文件，为渲染进程中使用的 Electron API 提供类型定义
 */
import { AudioMetadata } from './index';

// 导出 ElectronAPI 接口以便其他文件可以导入它
export interface ElectronAPI {
  /**
   * 选择音乐文件
   * @returns 返回选择的文件路径数组
   */
  selectMusicFiles: () => Promise<any>;

  /**
   * 读取音频文件
   * @param filePath 文件路径
   * @returns base64编码的文件内容
   */
  readAudioFile: (filePath: string) => Promise<string | null>;

  /**
   * 获取音频文件元数据
   * @param filePath 文件路径
   * @returns 音频元数据对象
   */
  getAudioMetadata: (filePath: string) => Promise<any | null>;

  // 设置相关
  getSettings: () => Promise<any>;
  saveSettings: (settings: any) => Promise<void>;
  selectFolder: () => Promise<any>;

  // 最近播放
  updateRecentlyPlayed: (song: any) => Promise<any[]>;
  getRecentlyPlayed: () => Promise<any[]>;

  // 路径工具
  joinPath: (...paths: string[]) => string;
  dirname: (p: string) => string;
  basename: (p: string) => string;
  extname: (p: string) => string;

  // 路径工具
  path: {
    join: (...args: string[]) => string;
    dirname: (p: string) => string;
    basename: (p: string) => string;
    extname: (p: string) => string;
  };

  // 测试连接
  testConnection: () => string;

  // 获取音频文件URL
  getAudioFileUrl: (filePath: string) => Promise<string>;

  // 歌词相关
  readLyricFile: (filePath: string) => Promise<string | null>;

  // 用户数据存储
  saveUserData: (key: string, data: any) => Promise<{ success: boolean } | { error: string }>;
  getUserData: (key: string) => Promise<any>;
}

/**
 * 扩展 Window 接口，添加 Electron API
 */
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

// 确保文件被视为模块
export { };