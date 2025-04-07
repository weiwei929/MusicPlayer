import { AudioMetadata } from '../types';

/**
 * 从音频文件路径中提取简单文件名
 * @param filePath 文件路径
 * @returns 文件名（不含扩展名）
 */
export function extractFileName(filePath: string): string {
  // 获取文件名（带扩展名）
  const fullFileName = filePath.split(/[\\\/]/).pop() || '';
  // 移除扩展名
  return fullFileName.replace(/\.[^.]+$/, '');
}

/**
 * 从文件名猜测曲目信息（简易实现）
 * 尝试根据文件名分析艺术家和标题，格式为 "艺术家 - 标题"
 * 
 * @param fileName 不含扩展名的文件名
 * @returns 包含猜测艺术家和标题的对象
 */
export function guessTrackInfo(fileName: string): { artist?: string, title: string } {
  // 尝试匹配"艺术家 - 标题"格式
  const match = fileName.match(/^(.+?)\s*-\s*(.+)$/);
  
  if (match) {
    return {
      artist: match[1].trim(),
      title: match[2].trim()
    };
  }
  
  // 如果无法匹配，则整个文件名作为标题
  return {
    title: fileName.trim()
  };
}

/**
 * 从文件路径创建基本音频元数据
 * 由于没有实际解析音频文件，这是一个简化的实现
 * 
 * @param filePath 音频文件路径
 * @returns 音频元数据对象
 */
export function createBasicMetadata(filePath: string): AudioMetadata {
  const fileName = extractFileName(filePath);
  const { artist, title } = guessTrackInfo(fileName);
  
  return {
    title,
    artist,
    path: filePath,
    // 生成一个随机时长（实际应用中应该从文件中提取）
    duration: Math.floor(Math.random() * 300) + 120 // 2-7分钟
  };
}

/**
 * 将时间秒数格式化为 mm:ss 格式
 * @param seconds 时间（秒）
 * @returns 格式化的时间字符串
 */
export function formatDuration(seconds?: number): string {
  if (!seconds) return '--:--';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}