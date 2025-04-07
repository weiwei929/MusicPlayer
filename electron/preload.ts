import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '../src/shared/constants'

/**
 * 预加载脚本
 * 
 * 该脚本在渲染进程中执行，但拥有访问 Node.js 和 Electron API 的权限
 * 通过 contextBridge 向渲染进程安全地暴露部分 Electron 功能
 */

// 定义更具体的类型
interface AudioMetadata {
  title?: string;
  artist?: string;
  album?: string;
  year?: string;
  genre?: string;
  duration?: number;
  path: string;
  coverArt?: string;
}

// 暴露给渲染进程的 API
contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * 选择音乐文件
   * @returns 返回选择的文件路径数组
   */
  selectMusicFiles: async (): Promise<string[]> => {
    try {
      return await ipcRenderer.invoke(IPC_CHANNELS.SELECT_MUSIC_FILES)
    } catch (error) {
      console.error('Failed to select music files:', error)
      return []
    }
  },

  /**
   * 读取音频文件
   * @param filePath 文件路径
   * @returns base64编码的文件内容
   */
  readAudioFile: async (filePath: string): Promise<string | null> => {
    try {
      return await ipcRenderer.invoke(IPC_CHANNELS.READ_AUDIO_FILE, filePath)
    } catch (error) {
      console.error('Failed to read audio file:', error)
      return null
    }
  },

  /**
   * 获取音频文件元数据
   * @param filePath 文件路径
   * @returns 音频元数据对象
   */
  getAudioMetadata: async (filePath: string): Promise<AudioMetadata | null> => {
    try {
      return await ipcRenderer.invoke(IPC_CHANNELS.GET_AUDIO_METADATA, filePath)
    } catch (error) {
      console.error('Failed to get audio metadata:', error)
      return null
    }
  }
})

// 在预加载脚本加载完成后记录
console.log('Electron preload script loaded')