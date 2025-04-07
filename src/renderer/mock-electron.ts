// 用于开发环境模拟Electron API
export const ipcRenderer = {
  invoke: async (channel: string, ...args: any[]) => {
    console.log(`Mock ipcRenderer.invoke called with channel: ${channel}`, args);
    // 根据不同的通道返回模拟数据
    switch (channel) {
      case 'select-music-files':
        return { success: true, data: [] };
      case 'scan-music-folder':
        return { success: true, data: { files: [], folderPath: 'mock/path' } };
      case 'get-audio-metadata':
        return { 
          success: true, 
          data: {
            common: {
              title: 'Mock Song',
              artist: 'Mock Artist',
              album: 'Mock Album',
              year: 2023,
              genre: ['Mock Genre'],
              track: { no: 1, of: 10 },
              disk: { no: 1, of: 1 },
            },
            format: {
              duration: 180,
            }
          } 
        };
      default:
        return { success: false, error: 'Unknown channel' };
    }
  },
  on: (channel: string, listener: Function) => {
    console.log(`Mock ipcRenderer.on registered for channel: ${channel}`);
  },
  removeListener: (channel: string, listener: Function) => {
    console.log(`Mock ipcRenderer.removeListener for channel: ${channel}`);
  }
};
