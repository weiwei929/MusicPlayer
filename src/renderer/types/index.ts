/**
 * 应用程序通用类型定义
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
 * 音乐曲目接口
 */
export interface Track {
  id: string;
  title: string;
  artist?: string;
  album?: string;
  duration?: number;
  path: string;
  coverArt?: string;
  addedAt: number;
}
/**
 * 播放列表接口
 */
export interface Playlist {
  id: string;
  name: string;
  tracks: string[]; // Track IDs
  createdAt: number;
  updatedAt: number;
}

/**
 * 播放器状态枚举
 */
export enum PlayerState {
  PLAYING = 'playing',
  PAUSED = 'paused',
  STOPPED = 'stopped',
  LOADING = 'loading'
}