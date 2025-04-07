/**
 * 音乐播放器应用的类型定义
 */

// 播放器状态枚举
export enum PlayerState {
  PLAYING = 'playing',
  PAUSED = 'paused',
  STOPPED = 'stopped',
  LOADING = 'loading',
  ERROR = 'error'
}

// 歌曲信息接口
export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // 以秒为单位
  path: string;
  coverArt?: string | null;
  year?: number;
  genre?: string;
  trackNumber?: number;
  discNumber?: number;
  added?: Date;
  lastPlayed?: Date;
  playCount?: number;
}

// 专辑信息接口
export interface Album {
  id: string;
  name: string;
  artist: string;
  year?: number;
  coverArt?: string | null;
  tracks: Track[];
}

// 艺术家信息接口
export interface Artist {
  id: string;
  name: string;
  albums: Album[];
  genres?: string[];
  image?: string | null;
}

// 播放列表接口
export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverArt?: string | null;
  tracks: Track[];
  createdAt: Date;
  updatedAt: Date;
}

// 播放模式类型
export type PlayMode = 'normal' | 'repeat_all' | 'repeat_one' | 'shuffle';

// 音频品质类型
export type AudioQuality = 'low' | 'medium' | 'high';

// 应用主题
export type Theme = 'light' | 'dark' | 'system';

// 应用设置接口
export interface AppSettings {
  theme: Theme;
  audioQuality: AudioQuality;
  autoPlay: boolean;
  language: string;
  defaultMusicFolder?: string;
  visualizerEnabled?: boolean;
  crossfadeSeconds?: number;
  equalizerPreset?: string;
}

// 音乐库状态接口
export interface LibraryState {
  tracks: Track[];
  albums: Album[];
  artists: Artist[];
  playlists: Playlist[];
  isLoading: boolean;
  error: string | null;
}

// 播放器状态接口
export interface PlayerStateInterface {
  currentTrack: Track | null;
  queue: Track[];
  state: PlayerState;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  playMode: PlayMode;
}

// 音频元数据接口
export interface AudioMetadata {
  title?: string;
  artist?: string;
  album?: string;
  year?: number;
  track?: number;
  disc?: number;
  genre?: string[];
  picture?: {
    format: string;
    data: Uint8Array;
  }[];
  duration?: number;
}

// 过滤器接口
export interface Filter {
  type: 'artist' | 'album' | 'genre' | 'year';
  value: string;
}

// 搜索结果接口
export interface SearchResults {
  tracks: Track[];
  albums: Album[];
  artists: Artist[];
  playlists: Playlist[];
}

// 均衡器预设接口
export interface EqualizerPreset {
  id: string;
  name: string;
  values: number[]; // 各频段增益值
}

// 音乐可视化器配置
export interface VisualizerConfig {
  type: 'bars' | 'wave' | 'circle';
  sensitivity: number;
  colorScheme: string;
}

// IPC 响应接口
export interface IpcResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// 拖放操作类型
export type DragItemType = 'track' | 'album' | 'playlist' | 'artist';

// 拖放数据接口
export interface DragItem {
  type: DragItemType;
  id: string;
}
