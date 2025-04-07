/**
 * 生成唯一ID的工具函数
 * 
 * 由于无法安装uuid包，这是一个简单的替代方案
 */

/**
 * 生成一个简单的唯一ID
 * 注意：这不如uuid包安全，但对于简单应用足够了
 * @returns 生成的唯一ID
 */
export function generateId(): string {
  return 'id_' + 
    Math.random().toString(36).substring(2, 15) + 
    Math.random().toString(36).substring(2, 15) + 
    Date.now().toString(36);
}