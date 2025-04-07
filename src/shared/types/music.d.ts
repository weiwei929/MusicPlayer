/**
 * Electron API 类型定义
 * 
 * 此文件为 TypeScript 类型声明文件，为渲染进程中使用的 Electron API 提供类型定义
 */

/**
 * 音频元数据接口
 */
export interface AudioMetadata {
  title?: string;
  artist?: string;
  album?: string;
  year?: string;
  genre?: string;
  duration?: number;
  path: string;
  coverArt?: string;
}

/**
 * Electron API 接口
 */
export interface ElectronAPI {
  selectMusicFiles: () => Promise<string[]>;
  readAudioFile: (filePath: string) => Promise<string | null>;
  getAudioMetadata: (filePath: string) => Promise<AudioMetadata | null>;
}

// 使用声明合并扩展 Window 接口
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}