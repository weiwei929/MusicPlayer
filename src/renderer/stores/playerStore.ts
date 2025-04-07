import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Howl } from 'howler';
import { Song } from './playlistStore';

export const usePlayerStore = defineStore('player', () => {
    // 播放器状态
    const currentSong = ref<Song | null>(null);
    const isPlaying = ref(false);
    const volume = ref(0.5); // 0 到 1
    const currentTime = ref(0);
    const duration = ref(0);
    const queue = ref<Song[]>([]);
    const queueIndex = ref(-1);

    // Howler 实例，声明为可导出属性以便外部访问
    let sound: Howl | null = null;

    // 计算属性: 播放进度百分比
    const progress = computed(() => {
        if (duration.value === 0) return 0;
        return (currentTime.value / duration.value) * 100;
    });

    // 加载并播放歌曲
    const playSong = (song: Song) => {
        console.log('playerStore: playSong 被调用', song);

        // 如果有正在播放的歌曲，先停止
        if (sound) {
            console.log('playerStore: 停止当前音频');
            sound.stop();
            sound.unload();
            sound = null;
        }

        // 更新当前歌曲
        currentSong.value = song;

        // 重置播放状态
        currentTime.value = 0;

        // 使用IPC创建一个临时服务器或转换文件路径
        if (window.electronAPI && window.electronAPI.getAudioFileUrl) {
            console.log('playerStore: 获取音频URL', song.path);

            window.electronAPI.getAudioFileUrl(song.path).then((result) => {
                // 检查是否有错误
                if (result && typeof result === 'object' && 'error' in result) {
                    console.error('获取音频URL失败:', result.error);
                    // 显示错误通知给用户
                    if (typeof window.alert === 'function') {
                        window.alert(`无法播放音乐: ${result.error}`);
                    }
                    return;
                }

                const audioUrl = result as string;
                console.log('加载音频URL:', audioUrl);

                try {
                    console.log('创建Howl实例前');
                    // 创建新的 Howl 实例
                    sound = new Howl({
                        src: [audioUrl],
                        html5: true,
                        volume: volume.value,
                        format: ['mp3', 'wav', 'flac', 'ogg', 'aac'], // 指定支持的格式
                        xhr: {
                            method: 'GET',
                            headers: {
                                // 添加必要的头信息
                                'Cache-Control': 'no-cache',
                                'Pragma': 'no-cache',
                                'Expires': '0'
                            }
                        },
                        onplay: () => {
                            console.log('playerStore: 音频开始播放');
                            isPlaying.value = true;
                            updateProgress();
                        },
                        onpause: () => {
                            console.log('playerStore: 音频暂停');
                            isPlaying.value = false;
                        },
                        onstop: () => {
                            console.log('playerStore: 音频停止');
                            isPlaying.value = false;
                        },
                        onend: () => {
                            console.log('playerStore: 音频播放结束');
                            // 当歌曲正常播放结束时，自动播放下一首
                            nextSong(true); // 这里使用true，确保自动播放
                        },
                        onload: () => {
                            duration.value = sound ? sound.duration() : 0;
                            console.log(`音频加载完成，时长: ${duration.value}秒`);
                            // 总是从开始播放，不保留上次位置
                            currentTime.value = 0;
                            if (sound) {
                                sound.seek(0);
                            }
                        },
                        onloaderror: (id, error) => {
                            console.error('加载音频失败:', error, '音频URL:', audioUrl);
                            // 出错时不自动播放下一首
                            nextSong(false);
                        },
                        onplayerror: (id, error) => {
                            console.error('播放音频失败:', error, '音频URL:', audioUrl);
                            // 出错时不自动播放下一首
                            nextSong(false);
                        }
                    });

                    console.log('playerStore: 尝试播放音频');
                    // 开始播放
                    console.log('playerStore: 开始播放音频');
                    sound.play();
                    console.log('playerStore: 播放命令已发出');
                } catch (howlError) {
                    console.error('创建Howl实例失败:', howlError);
                    if (typeof window.alert === 'function') {
                        window.alert(`创建音频播放器失败: ${howlError.message || '未知错误'}`);
                    }
                }
            }).catch(error => {
                console.error('获取音频URL失败:', error);
                // 显示错误通知给用户
                if (typeof window.alert === 'function') {
                    window.alert(`无法播放音乐: ${error.message || '未知错误'}`);
                }
            });
        } else {
            console.error('Electron API不可用，无法获取音频URL');
        }
    };

    // 更新播放进度
    const updateProgress = () => {
        if (sound && isPlaying.value) {
            currentTime.value = sound.seek();
            requestAnimationFrame(updateProgress);
        }
    };

    // 播放/暂停切换
    const togglePlay = () => {
        console.log('playerStore: togglePlay 被调用');

        if (!sound && currentSong.value) {
            console.log('playerStore: 没有音频实例，开始播放当前歌曲');
            playSong(currentSong.value);
            return;
        }

        if (!sound) {
            console.warn('playerStore: 没有音频实例且没有当前歌曲，无法切换播放状态');
            return;
        }

        if (isPlaying.value) {
            console.log('playerStore: 正在播放，执行暂停');
            sound.pause();
        } else {
            console.log('playerStore: 未播放，执行播放');
            sound.play();
        }
    };

    // 设置音量
    const setVolume = (newVolume: number) => {
        volume.value = newVolume;
        if (sound) {
            sound.volume(newVolume);
        }
    };

    // 跳转到指定时间点
    const seek = (time: number) => {
        if (sound) {
            sound.seek(time);
            currentTime.value = time;
        }
    };

    // 添加到播放队列
    const addToQueue = (songs: Song[]) => {
        queue.value.push(...songs);
    };

    // 设置播放队列，并从指定索引开始播放
    const setQueue = (songs: Song[], startIndex: number = 0, autoPlay: boolean = true) => {
        queue.value = [...songs];
        queueIndex.value = startIndex;

        if (startIndex >= 0 && startIndex < songs.length) {
            if (autoPlay) {
                playSong(songs[startIndex]);
            } else {
                // 只设置当前歌曲，但不播放
                currentSong.value = songs[startIndex];
                // 重置播放状态
                isPlaying.value = false;
                currentTime.value = 0;
                duration.value = 0;
            }
        }
    };

    // 播放下一首
    const nextSong = (autoPlay = false) => {
        if (queue.value.length === 0 || queueIndex.value >= queue.value.length - 1) {
            // 播放列表结束
            return;
        }

        queueIndex.value++;

        // 停止当前播放
        if (sound) {
            sound.stop();
            sound.unload();
            sound = null;
        }

        // 只有在明确指定自动播放时才播放，否则只更新当前歌曲
        if (autoPlay) {
            playSong(queue.value[queueIndex.value]);
        } else {
            // 只更新当前歌曲，不播放
            currentSong.value = queue.value[queueIndex.value];
            currentTime.value = 0;
            duration.value = 0;
            isPlaying.value = false;
        }
    };

    // 播放上一首
    const previousSong = (autoPlay = false) => {
        if (queue.value.length === 0 || queueIndex.value <= 0) {
            // 已经是第一首或没有歌曲
            return;
        }

        queueIndex.value--;

        // 停止当前播放
        if (sound) {
            sound.stop();
            sound.unload();
            sound = null;
        }

        // 只有在明确指定自动播放时才播放，否则只更新当前歌曲
        if (autoPlay) {
            playSong(queue.value[queueIndex.value]);
        } else {
            // 只更新当前歌曲，不播放
            currentSong.value = queue.value[queueIndex.value];
            currentTime.value = 0;
            duration.value = 0;
            isPlaying.value = false;
        }
    };

    // 清理资源
    const dispose = () => {
        if (sound) {
            sound.stop();
            sound.unload();
            sound = null;
        }
    };

    return {
        currentSong,
        isPlaying,
        volume,
        currentTime,
        duration,
        progress,
        queue,
        queueIndex,
        sound, // 导出sound实例，方便外部访问
        playSong,
        togglePlay,
        setVolume,
        seek,
        addToQueue,
        setQueue,
        nextSong,
        previousSong,
        dispose
    };
});
