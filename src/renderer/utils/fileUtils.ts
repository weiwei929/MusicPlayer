import { SUPPORTED_AUDIO_FORMATS } from '../../shared/constants';

/**
 * 检查文件是否为支持的音频格式
 * @param fileName 文件名
 * @returns 是否支持
 */
export function isSupportedAudioFile(fileName: string): boolean {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  return SUPPORTED_AUDIO_FORMATS.includes(extension as any);
}

/**
 * 获取文件扩展名
 * @param fileName 文件名
 * @returns 扩展名（小写）
 */
export function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() || '';
}

/**
 * 生成随机ID
 * 简化版本，实际应用中可使用uuid库
 * @returns 随机ID字符串
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
}

/**
 * 格式化文件大小
 * @param bytes 文件大小（字节）
 * @returns 格式化的文件大小字符串
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

/**
 * 安全地获取文件名（不含路径）
 * @param filePath 文件路径
 * @returns 文件名
 */
export function getFileName(filePath: string): string {
  return filePath.split(/[\\\/]/).pop() || '';
}

// 替换类似这样的代码:
// import * as path from 'path';
// const fullPath = path.join(directory, filename);

// 使用:
const fullPath = window.electronAPI.path.join(directory, filename);