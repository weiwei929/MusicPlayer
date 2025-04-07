// 简化的音乐播放器入口点，仅用于 Web 浏览器

// 添加演示用的音频资源
const demoTracks = [
    {
        id: '1',
        title: '示例音乐 1',
        artist: '示例艺术家',
        album: '示例专辑',
        duration: 180,
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        coverArt: 'https://picsum.photos/seed/music1/300/300'
    },
    {
        id: '2',
        title: '示例音乐 2',
        artist: '示例艺术家',
        album: '示例专辑',
        duration: 210,
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        coverArt: 'https://picsum.photos/seed/music2/300/300'
    },
    {
        id: '3',
        title: '示例音乐 3',
        artist: '示例艺术家',
        album: '示例专辑',
        duration: 240,
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        coverArt: 'https://picsum.photos/seed/music3/300/300'
    }
];

// 模拟 Electron IPC 以便在浏览器中运行
const mockIPC = {
    invoke: async (channel, ...args) => {
        console.log(`Mock IPC called: ${channel}`, args);

        // 返回模拟数据
        switch (channel) {
            case 'select-music-files':
                return {
                    success: true,
                    data: demoTracks.map(track => track.url)
                };
            case 'get-audio-metadata':
                const trackUrl = args[0];
                const track = demoTracks.find(t => t.url === trackUrl) || demoTracks[0];
                return {
                    success: true,
                    data: {
                        common: {
                            title: track.title,
                            artist: track.artist,
                            album: track.album,
                            year: 2023,
                            picture: [{
                                format: 'image/jpeg',
                                data: new Uint8Array([]), // 模拟图片数据
                                description: 'Cover'
                            }]
                        },
                        format: {
                            duration: track.duration
                        }
                    }
                };
            default:
                return { success: false, error: '未实现的功能' };
        }
    }
};

// 在浏览器环境下模拟 Electron 对象
if (typeof window !== 'undefined') {
    window.electron = {
        ipcRenderer: mockIPC
    };
}

console.log('Web 版本音乐播放器已初始化');
