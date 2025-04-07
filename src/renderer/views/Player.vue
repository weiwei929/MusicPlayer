<template>
  <div class="player-container">
    <div class="player-layout">
      <!-- 左侧播放列表区域 -->
      <div class="player-playlists">
        <PlaylistSelector 
          :playlists="playlists"
          :selectedPlaylistId="selectedPlaylistId"
          @select-playlist="handleSelectPlaylist"
          @create-playlist="handleCreatePlaylist"
          @manage-playlists="showPlaylistManager = true"
        />
        
        <div class="playlist-content" v-if="currentPlaylist">
          <h3>{{ currentPlaylist.name }}</h3>
          <div class="song-list">
            <div 
              v-for="(song, index) in currentPlaylist.songs" 
              :key="song.id"
              class="song-item"
              :class="{ active: currentSongId === song.id }"
              @click="playSong(song, index)"
            >
              <div class="song-info">
                <div class="song-title">{{ song.title }}</div>
                <div class="song-artist">{{ song.artist }}</div>
              </div>
              <div class="song-actions">
                <button @click.stop="removeFromPlaylist(song.id)" class="action-btn remove-btn">
                  移除
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="empty-playlist">
          <p>请选择或创建播放列表</p>
        </div>
      </div>
      
      <!-- 右侧播放器区域 -->
      <div class="player-main">
        <div class="now-playing">
          <div class="album-cover">
            <img v-if="currentTrack?.cover" :src="currentTrack.cover" alt="Album Cover" />
            <div v-else class="no-cover">
              <span>无封面</span>
            </div>
          </div>
          
          <div class="track-info">
            <h2>{{ currentTrack?.title || '未播放' }}</h2>
            <p>{{ currentTrack?.artist || '未知艺术家' }}</p>
            <p>{{ currentTrack?.album || '未知专辑' }}</p>
          </div>
        </div>
        
        <div class="player-controls">
          <div class="progress-bar">
            <div class="current-time">{{ formatTime(currentTime) }}</div>
            <div class="progress-slider">
              <input 
                type="range" 
                min="0" 
                :max="duration || 100" 
                v-model="currentTime"
                @input="handleSeek"
              />
              <div 
                class="progress-fill" 
                :style="{ width: `${((currentTime || 0) / (duration || 1)) * 100}%` }"
              ></div>
            </div>
            <div class="total-time">{{ formatTime(duration) }}</div>
          </div>
          
          <div class="control-buttons">
            <button @click="handlePrevious">
              上一首
            </button>
            <button class="play-button" @click="togglePlay">
              {{ isPlaying ? '暂停' : '播放' }}
            </button>
            <button @click="handleNext">
              下一首
            </button>
            <div class="volume-control">
              <span>音量</span>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01"
                v-model="volume"
                @input="handleVolumeChange"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 播放列表管理对话框 -->
    <PlaylistManagerDialog 
      v-if="showPlaylistManager"
      :playlists="playlists"
      @close="showPlaylistManager = false"
      @create-playlist="createPlaylist"
      @rename-playlist="renamePlaylist"
      @delete-playlist="deletePlaylist"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { usePlayerStore } from '../stores/playerStore';
import { usePlaylistStore, type Song, type Playlist } from '../stores/playlistStore';
import PlaylistSelector from '../components/PlaylistSelector.vue';
import PlaylistManagerDialog from '../components/PlaylistManagerDialog.vue';

const playerStore = usePlayerStore();
const playlistStore = usePlaylistStore();

// 从store中获取状态
const currentTrack = computed(() => playerStore.currentSong);
const isPlaying = computed(() => playerStore.isPlaying);
const currentTime = computed({
  get: () => playerStore.currentTime,
  set: (value) => playerStore.seek(Number(value))
});
const duration = computed(() => playerStore.duration);
const volume = computed({
  get: () => playerStore.volume,
  set: (value) => playerStore.setVolume(Number(value))
});

// 播放/暂停切换
const togglePlay = () => {
  console.log('Player.vue: 点击播放/暂停按钮');
  console.log('Player.vue: 当前歌曲:', currentTrack.value);
  console.log('Player.vue: 播放状态:', isPlaying.value);
  
  // 如果没有当前歌曲，直接返回
  if (!currentTrack.value) {
    console.warn('Player.vue: 没有当前选中的歌曲');
    return;
  }
  
  // 调用playerStore的togglePlay方法
  playerStore.togglePlay();
  
  // 检查播放状态是否已改变
  console.log('Player.vue: 切换后的播放状态:', playerStore.isPlaying);
};

// 上一首
const handlePrevious = () => {
  playerStore.previousSong(false); // 不自动播放
};

// 下一首
const handleNext = () => {
  playerStore.nextSong(false); // 不自动播放
};

// 进度条seek
const handleSeek = () => {
  // 已经通过计算属性的set方法处理
};

// 音量变化
const handleVolumeChange = () => {
  // 已经通过计算属性的set方法处理
};

// 格式化时间
const formatTime = (seconds: number): string => {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

onMounted(() => {
  // 检查是否有保存的播放列表和当前歌曲
  if (playlistStore.library.length > 0) {
    // 只设置播放队列，但不自动播放
    playerStore.setQueue(playlistStore.library, 0, false);
  }
});

// 播放列表相关
const playlists = computed(() => playlistStore.playlists);
const selectedPlaylistId = ref<string | null>(null);
const showPlaylistManager = ref(false);

const currentPlaylist = computed(() => {
  if (!selectedPlaylistId.value) return null;
  return playlists.value.find(p => p.id === selectedPlaylistId.value) || null;
});

const currentSongId = computed(() => playerStore.currentSong?.id || null);

// 播放列表操作
const handleSelectPlaylist = (playlistId: string) => {
  selectedPlaylistId.value = playlistId;
};

const handleCreatePlaylist = (name: string) => {
  const id = playlistStore.createPlaylist(name);
  selectedPlaylistId.value = id;
};

const createPlaylist = (name: string) => {
  const id = playlistStore.createPlaylist(name);
  return id;
};

const renamePlaylist = (playlistId: string, newName: string) => {
  playlistStore.renamePlaylist(playlistId, newName);
};

const deletePlaylist = (playlistId: string) => {
  playlistStore.removePlaylist(playlistId);
  if (selectedPlaylistId.value === playlistId) {
    selectedPlaylistId.value = playlists.value.length > 0 ? playlists.value[0].id : null;
  }
};

const removeFromPlaylist = (songId: string) => {
  if (selectedPlaylistId.value) {
    playlistStore.removeFromPlaylist(selectedPlaylistId.value, songId);
  }
};

const playSong = (song: Song, index: number) => {
  if (currentPlaylist.value) {
    playerStore.setQueue(currentPlaylist.value.songs, index, true);
  }
};

// 初始化选择第一个播放列表
watch(playlists, (newPlaylists) => {
  if (newPlaylists.length > 0 && !selectedPlaylistId.value) {
    selectedPlaylistId.value = newPlaylists[0].id;
  }
}, { immediate: true });
</script>

<style scoped>
.player-container {
  height: 100%;
  padding: 1rem;
}

.player-layout {
  display: flex;
  height: 100%;
}

.player-playlists {
  width: 300px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #eee;
  padding-right: 1rem;
  margin-right: 1rem;
}

.playlist-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.song-list {
  flex: 1;
  overflow-y: auto;
}

.song-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.song-item:hover {
  background-color: #f9f9f9;
}

.song-item.active {
  background-color: #e6f7ff;
}

.song-info {
  flex: 1;
  min-width: 0;
}

.song-title {
  font-weight: 500;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: 0.85rem;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-actions {
  display: flex;
  align-items: center;
}

.action-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}

.action-btn:hover {
  color: #333;
}

.remove-btn:hover {
  color: #f44336;
}

.empty-playlist {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

.player-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.now-playing {
  display: flex;
  gap: 2rem;
  padding: 2rem;
  background-color: #f0f0f0;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.album-cover {
  width: 200px;
  height: 200px;
  background-color: #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.album-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-cover {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

.track-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.track-info h2 {
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
}

.track-info p {
  margin-bottom: 0.25rem;
  color: #666;
}

.player-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.progress-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-slider {
  flex: 1;
  position: relative;
  height: 4px;
  background-color: #ddd;
  border-radius: 2px;
}

.progress-slider input {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 2;
}

.progress-fill {
  position: absolute;
  height: 100%;
  background-color: #1db954;
  border-radius: 2px;
}

.control-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.control-buttons button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background-color: #eee;
  cursor: pointer;
}

.control-buttons button:hover {
  background-color: #ddd;
}

.play-button {
  background-color: #1db954 !important;
  color: white;
  padding: 0.5rem 2rem !important;
}

.play-button:hover {
  background-color: #1ed760 !important;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: 2rem;
}

.volume-control input {
  width: 100px;
}
</style>