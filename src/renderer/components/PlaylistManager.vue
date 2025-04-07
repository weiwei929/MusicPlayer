<template>
  <div class="playlist-manager">
    <div class="playlists-header">
      <h3>播放列表</h3>
      <button @click="createNewPlaylist" class="create-playlist-btn">
        <span>+</span> 新建播放列表
      </button>
    </div>
    
    <div class="playlists-container">
      <div 
        v-for="playlist in playlists" 
        :key="playlist.id"
        class="playlist-item"
        :class="{ active: currentPlaylistId === playlist.id }"
        @click="selectPlaylist(playlist.id)"
      >
        <div class="playlist-info">
          <template v-if="editingPlaylistId === playlist.id">
            <input 
              v-model="editingPlaylistName" 
              @keyup.enter="savePlaylistName(playlist.id)"
              @blur="savePlaylistName(playlist.id)"
              ref="editNameInput"
              class="playlist-name-input"
            />
          </template>
          <template v-else>
            <span class="playlist-name">{{ playlist.name }}</span>
            <span class="playlist-count">{{ playlist.songs.length }}首歌曲</span>
          </template>
        </div>
        <div class="playlist-actions">
          <button @click.stop="renamePlaylist(playlist.id)" class="action-btn">
            重命名
          </button>
          <button @click.stop="confirmDeletePlaylist(playlist.id)" class="action-btn delete-btn">
            删除
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="currentPlaylist" class="playlist-songs">
      <h4>{{ currentPlaylist.name }}</h4>
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

    <!-- 创建播放列表对话框 -->
    <div v-if="showCreateDialog" class="dialog-overlay">
      <div class="dialog-content">
        <h3>创建新播放列表</h3>
        <input 
          v-model="newPlaylistName" 
          placeholder="播放列表名称" 
          @keyup.enter="confirmCreatePlaylist"
          ref="newPlaylistInput"
        />
        <div class="dialog-actions">
          <button @click="showCreateDialog = false" class="cancel-btn">取消</button>
          <button @click="confirmCreatePlaylist" class="confirm-btn">创建</button>
        </div>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <div v-if="showDeleteDialog" class="dialog-overlay">
      <div class="dialog-content">
        <h3>删除播放列表</h3>
        <p>确定要删除播放列表"{{ playlistToDelete?.name }}"吗？</p>
        <div class="dialog-actions">
          <button @click="showDeleteDialog = false" class="cancel-btn">取消</button>
          <button @click="deletePlaylist" class="delete-confirm-btn">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { usePlaylistStore, type Playlist, type Song } from '../stores/playlistStore';
import { usePlayerStore } from '../stores/playerStore';

const playlistStore = usePlaylistStore();
const playerStore = usePlayerStore();

const playlists = computed(() => playlistStore.playlists);
const currentPlaylistId = ref<string | null>(null);
const currentSongId = computed(() => playerStore.currentSong?.id || null);

const currentPlaylist = computed(() => {
  if (!currentPlaylistId.value) return null;
  return playlists.value.find(p => p.id === currentPlaylistId.value) || null;
});

const showCreateDialog = ref(false);
const newPlaylistName = ref('');
const newPlaylistInput = ref<HTMLInputElement | null>(null);

const showDeleteDialog = ref(false);
const playlistToDelete = ref<Playlist | null>(null);

const editingPlaylistId = ref<string | null>(null);
const editingPlaylistName = ref('');
const editNameInput = ref<HTMLInputElement | null>(null);

// 选择播放列表
const selectPlaylist = (playlistId: string) => {
  currentPlaylistId.value = playlistId;
};

// 创建新播放列表 - 使用对话框代替prompt
const createNewPlaylist = () => {
  showCreateDialog.value = true;
  newPlaylistName.value = '新播放列表';
  
  // 等待DOM更新后聚焦输入框
  nextTick(() => {
    if (newPlaylistInput.value) {
      newPlaylistInput.value.focus();
      newPlaylistInput.value.select();
    }
  });
};

// 确认创建播放列表
const confirmCreatePlaylist = () => {
  if (newPlaylistName.value.trim()) {
    const id = playlistStore.createPlaylist(newPlaylistName.value.trim());
    currentPlaylistId.value = id;
    showCreateDialog.value = false;
  }
};

// 确认删除播放列表 - 使用对话框代替confirm
const confirmDeletePlaylist = (playlistId: string) => {
  const playlist = playlists.value.find(p => p.id === playlistId);
  if (playlist) {
    playlistToDelete.value = playlist;
    showDeleteDialog.value = true;
  }
};

// 执行删除播放列表
const deletePlaylist = () => {
  if (playlistToDelete.value) {
    const playlistId = playlistToDelete.value.id;
    playlistStore.removePlaylist(playlistId);
    
    if (currentPlaylistId.value === playlistId) {
      currentPlaylistId.value = playlists.value.length > 0 ? playlists.value[0].id : null;
    }
    
    showDeleteDialog.value = false;
    playlistToDelete.value = null;
  }
};

// 重命名播放列表
const renamePlaylist = (playlistId: string) => {
  const playlist = playlists.value.find(p => p.id === playlistId);
  if (playlist) {
    editingPlaylistId.value = playlistId;
    editingPlaylistName.value = playlist.name;
    nextTick(() => {
      if (editNameInput.value) {
        editNameInput.value.focus();
      }
    });
  }
};

// 保存播放列表名称
const savePlaylistName = (playlistId: string) => {
  if (editingPlaylistName.value.trim()) {
    playlistStore.renamePlaylist(playlistId, editingPlaylistName.value.trim());
  }
  editingPlaylistId.value = null;
};

// 播放歌曲
const playSong = (song: Song, index: number) => {
  if (currentPlaylist.value) {
    playerStore.setQueue(currentPlaylist.value.songs, index, true);
  }
};

// 从播放列表中移除歌曲
const removeFromPlaylist = (songId: string) => {
  if (currentPlaylistId.value) {
    playlistStore.removeFromPlaylist(currentPlaylistId.value, songId);
  }
};

// 初始化选择第一个播放列表
watch(playlists, (newPlaylists) => {
  if (newPlaylists.length > 0 && !currentPlaylistId.value) {
    currentPlaylistId.value = newPlaylists[0].id;
  }
}, { immediate: true });
</script>

<style scoped>
.playlist-manager {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.playlists-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.create-playlist-btn {
  background-color: #1db954;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.create-playlist-btn:hover {
  background-color: #1ed760;
}

.playlists-container {
  margin-bottom: 1rem;
  max-height: 30%;
  overflow-y: auto;
  border-bottom: 1px solid #eee;
  padding-bottom: 1rem;
}

.playlist-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  cursor: pointer;
}

.playlist-item:hover {
  background-color: #eee;
}

.playlist-item.active {
  background-color: #e6f7ff;
  border-left: 3px solid #1db954;
}

.playlist-info {
  display: flex;
  flex-direction: column;
}

.playlist-name {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.playlist-count {
  font-size: 0.85rem;
  color: #666;
}

.playlist-name-input {
  padding: 0.25rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100%;
}

.playlist-actions {
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

.delete-btn:hover {
  background-color: #ffebee;
  border-color: #f44336;
  color: #f44336;
}

.remove-btn:hover {
  color: #f44336;
}

.playlist-songs {
  flex: 1;
  overflow-y: auto;
}

.song-list {
  display: flex;
  flex-direction: column;
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
  display: flex;
  flex-direction: column;
}

.song-title {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.song-artist {
  font-size: 0.85rem;
  color: #666;
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
  padding: 1.5rem;
  width: 300px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.dialog-content h3 {
  margin-top: 0;
  margin-bottom: 1rem;
}

.dialog-content input {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.cancel-btn {
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.confirm-btn {
  background-color: #1db954;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.confirm-btn:hover {
  background-color: #1ed760;
}

.delete-confirm-btn {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.delete-confirm-btn:hover {
  background-color: #e53935;
}
</style>
