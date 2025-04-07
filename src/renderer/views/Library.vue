<template>
  <div 
    class="library-container"
    @dragover="handleDragOver"
    @drop="handleDrop"
  >
    <div class="library-header">
      <h2>音乐库</h2>
      <button class="add-music-btn" @click="handleAddMusic">
        添加音乐
      </button>
    </div>
    
    <div class="music-list" v-if="musicFiles.length > 0">
      <div 
        v-for="(file, index) in musicFiles" 
        :key="file.id"
        class="music-item"
        @click="selectMusic(file)"
        :class="{ 'active': selectedMusic === file }"
      >
        <div class="music-info">
          <h3>{{ file.title || file.name }}</h3>
          <p>{{ file.artist || '未知艺术家' }} · {{ file.album || '未知专辑' }}</p>
        </div>
        <div class="music-actions">
          <button @click.stop="addToPlaylist(file)" class="action-btn">
            添加到播放列表
          </button>
          <button @click.stop="removeFile(file)" class="action-btn remove-btn">
            删除
          </button>
        </div>
      </div>
    </div>
    
    <div class="empty-library" v-else>
      <p>音乐库是空的</p>
      <p>点击"添加音乐"按钮导入音乐文件</p>
    </div>
    
    <!-- 播放列表选择对话框 -->
    <div v-if="showPlaylistSelector" class="dialog-overlay">
      <div class="dialog-content">
        <div class="dialog-header">
          <h3>添加到播放列表</h3>
          <button @click="showPlaylistSelector = false" class="close-btn">✕</button>
        </div>
        
        <div class="playlists-container">
          <div 
            v-for="playlist in playlists" 
            :key="playlist.id"
            class="playlist-option"
            @click="confirmAddToPlaylist(playlist.id)"
          >
            <div class="playlist-name">{{ playlist.name }}</div>
            <div class="playlist-count">{{ playlist.songs.length }}首歌曲</div>
          </div>
          
          <div v-if="playlists.length === 0" class="no-playlists">
            没有可用的播放列表
          </div>
        </div>
        
        <div class="create-new">
          <input 
            v-model="newPlaylistName" 
            placeholder="新播放列表名称"
            @keyup.enter="createAndAddToPlaylist"
            class="new-playlist-input"
          />
          <button @click="createAndAddToPlaylist" class="create-btn">创建并添加</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { usePlayerStore } from '../stores/playerStore';
import { usePlaylistStore, type Song } from '../stores/playlistStore';

// 使用store
const playerStore = usePlayerStore();
const playlistStore = usePlaylistStore();
const playlists = computed(() => playlistStore.playlists);

// 类型定义
interface MusicFile {
  id: string;
  path: string;
  name: string;
  title?: string;
  artist?: string;
  album?: string;
  duration?: number;
}

const musicFiles = ref<MusicFile[]>([]);
const selectedMusic = ref<MusicFile | null>(null);

// 添加音乐处理函数
const handleAddMusic = async () => {
  try {
    if (window.electronAPI?.selectMusicFiles) {
      const result = await window.electronAPI.selectMusicFiles();
      console.log('选择的音乐文件:', result);
      
      // 使用通用函数处理文件
      await handleAddMusicFiles(result);
    } else {
      console.error('Electron API不可用');
    }
  } catch (error) {
    console.error('添加音乐出错:', error);
  }
};

// 选择音乐
const selectMusic = (file: MusicFile) => {
  selectedMusic.value = file;
};

// 移除文件
const removeFile = (file: MusicFile) => {
  if (confirm(`确定要从音乐库中删除"${file.title || file.name}"吗？`)) {
    const index = musicFiles.value.findIndex(f => f.id === file.id);
    if (index !== -1) {
      musicFiles.value.splice(index, 1);
    }
    
    if (selectedMusic.value === file) {
      selectedMusic.value = null;
    }
  }
};

// 播放列表相关
const showPlaylistSelector = ref(false);
const fileToAdd = ref<MusicFile | null>(null);
const newPlaylistName = ref('');

// 添加到播放列表
const addToPlaylist = (file: MusicFile) => {
  fileToAdd.value = file;
  showPlaylistSelector.value = true;
  newPlaylistName.value = '';
};

// 确认添加到播放列表
const confirmAddToPlaylist = (playlistId: string) => {
  if (fileToAdd.value) {
    const song: Song = {
      id: fileToAdd.value.id,
      title: fileToAdd.value.title || fileToAdd.value.name,
      artist: fileToAdd.value.artist || '未知艺术家',
      album: fileToAdd.value.album || '未知专辑',
      path: fileToAdd.value.path,
      duration: fileToAdd.value.duration || 0,
      cover: fileToAdd.value.cover
    };
    
    playlistStore.addToPlaylist(playlistId, [song]);
    showPlaylistSelector.value = false;
    fileToAdd.value = null;
  }
};

// 创建新播放列表并添加
const createAndAddToPlaylist = () => {
  if (newPlaylistName.value.trim() && fileToAdd.value) {
    const playlistId = playlistStore.createPlaylist(newPlaylistName.value.trim());
    confirmAddToPlaylist(playlistId);
  }
};

// 添加新的函数来处理从拖放获取的文件
const handleAddMusicFiles = async (result: { canceled: boolean, filePaths: string[] }) => {
  try {
    if (!result.canceled && result.filePaths.length > 0) {
      // 处理每个文件
      const newFiles: MusicFile[] = [];
      const newSongs: Song[] = [];
      
      for (const path of result.filePaths) {
        // 从路径中提取文件名
        const name = path.split(/[\\/]/).pop() || '';
        const id = uuidv4();
        
        // 创建基本文件对象
        const fileObj: MusicFile = {
          id,
          path,
          name,
          title: name.replace(/\.[^/.]+$/, ""),
          artist: '未知艺术家',
          album: '未知专辑',
          duration: 0
        };
        
        // 尝试获取元数据
        if (window.electronAPI.getAudioMetadata) {
          try {
            const metadata = await window.electronAPI.getAudioMetadata(path);
            if (!metadata.error) {
              fileObj.title = metadata.title || fileObj.title;
              fileObj.artist = metadata.artist;
              fileObj.album = metadata.album;
              fileObj.duration = metadata.duration;
              // 如果有封面图片
              if (metadata.cover) {
                fileObj.cover = metadata.cover;
              }
            }
          } catch (metadataError) {
            console.warn(`无法获取文件元数据: ${path}`, metadataError);
          }
        }
        
        newFiles.push(fileObj);
        
        // 同时创建Song对象添加到播放列表
        const song: Song = {
          id: fileObj.id,
          title: fileObj.title || fileObj.name,
          artist: fileObj.artist || '未知艺术家',
          album: fileObj.album || '未知专辑',
          path: fileObj.path,
          duration: fileObj.duration || 0,
          cover: fileObj.cover
        };
        
        newSongs.push(song);
      }
      
      // 更新音乐文件列表
      musicFiles.value = [...musicFiles.value, ...newFiles];
      console.log('更新后的音乐文件列表:', musicFiles.value);
      
      // 添加到播放列表库
      playlistStore.addToLibrary(newSongs);
    }
  } catch (error) {
    console.error('添加音乐出错:', error);
  }
};

// 格式化时长
const formatDuration = (duration?: number): string => {
  if (!duration) return '0:00';
  
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// 如果有拖拽相关的函数，修复它们
const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
  // 使用正确的变量名
};

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
};

const handleDrop = async (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
  
  if (event.dataTransfer?.files) {
    const audioFiles = Array.from(event.dataTransfer.files)
      .filter(file => {
        const extension = file.name.split('.').pop()?.toLowerCase();
        return ['mp3', 'wav', 'ogg', 'flac', 'aac'].includes(extension || '');
      });
    
    if (audioFiles.length > 0) {
      const filePaths = audioFiles.map(file => file.path);
      console.log('拖拽添加的音频文件:', filePaths);
      
      // 使用通用函数处理文件
      await handleAddMusicFiles({
        canceled: false,
        filePaths
      });
    }
  }
};

onMounted(() => {
  // 如果有已保存的库，加载它
  if (playlistStore.library.length > 0) {
    // 将库中的歌曲转换为musicFiles
    const files = playlistStore.library.map(song => ({
      id: song.id,
      path: song.path,
      name: song.title,
      title: song.title,
      artist: song.artist,
      album: song.album,
      duration: song.duration,
      cover: song.cover
    }));
    
    musicFiles.value = files;
  }
});
</script>

<style scoped>
.library-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.library-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.add-music-btn {
  background-color: #1db954;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.add-music-btn:hover {
  background-color: #1ed760;
}

.music-list {
  flex: 1;
  overflow: auto;
}

.music-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.music-item:hover {
  background-color: #eee;
}

.music-item.active {
  background-color: #e6f7ff;
}

.music-info h3 {
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.music-info p {
  font-size: 0.85rem;
  color: #666;
}

.music-duration {
  color: #666;
}

.empty-library {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
}

.music-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
  cursor: pointer;
}

.action-btn:hover {
  background-color: #e0e0e0;
}

.remove-btn:hover {
  background-color: #ffebee;
  border-color: #f44336;
  color: #f44336;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-content {
  background-color: white;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.dialog-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #999;
}

.close-btn:hover {
  color: #333;
}

.playlists-container {
  padding: 1rem;
  max-height: 50vh;
  overflow-y: auto;
}

.playlist-option {
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  background-color: #f5f5f5;
  cursor: pointer;
}

.playlist-option:hover {
  background-color: #e6f7ff;
}

.playlist-name {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.playlist-count {
  font-size: 0.85rem;
  color: #666;
}

.no-playlists {
  text-align: center;
  padding: 1rem;
  color: #999;
}

.create-new {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #eee;
}

.new-playlist-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.create-btn {
  background-color: #1db954;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  white-space: nowrap;
}

.create-btn:hover {
  background-color: #1ed760;
}
</style>