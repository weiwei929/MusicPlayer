import * as mm from 'music-metadata';
import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../shared/constants';
import * as fs from 'fs';

export function setupAudioMetadataHandlers() {
    ipcMain.handle(IPC_CHANNELS.GET_AUDIO_METADATA, async (_, filePath) => {
        try {
            if (!fs.existsSync(filePath)) {
                throw new Error(`File does not exist: ${filePath}`);
            }

            const metadata = await mm.parseFile(filePath);

            // 转换成安全的对象，去除不可序列化的内容
            return {
                format: {
                    ...metadata.format,
                    // 确保Buffer可以序列化
                    container: metadata.format.container || null,
                    codec: metadata.format.codec || null,
                    duration: metadata.format.duration || 0,
                    bitrate: metadata.format.bitrate || 0,
                    sampleRate: metadata.format.sampleRate || 0,
                    numberOfChannels: metadata.format.numberOfChannels || 0,
                },
                common: {
                    ...metadata.common,
                    // 转换图片为base64或保留null
                    picture: metadata.common.picture?.map(pic => ({
                        format: pic.format,
                        data: pic.data.toString('base64'),
                        type: pic.type,
                        description: pic.description,
                    })) || null,
                }
            };
        } catch (error) {
            console.error('Error parsing audio metadata:', error);
            throw error;
        }
    });
}
