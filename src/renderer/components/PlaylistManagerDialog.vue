<template>
  <div class="dialog-overlay">
    <div class="dialog-content">
      <div class="dialog-header">
        <h3>管理播放列表</h3>
        <button @click="$emit('close')" class="close-btn">✕</button>
      </div>
      
      <div class="playlists-container">
        <div 
          v-for="playlist in playlists" 
          :key="playlist.id"
          class="playlist-item"
        >
          <div class="playlist-info">
            <template v-if="editingPlaylistId === playlist.id">
              <input 
                v-model="editingPlaylistName" 
                @keyup.enter="confirmRename(playlist.id)"
                @blur="cancelEdit"
                ref="editNameInput"
                class="edit-name-input"
              />
            </template>
            <template v-else>
              <div class="playlist-name">{{ playlist.name }}</div>
              <div class="playlist-count">{{ playlist.songs.length }}首歌曲</div>
            </template>
          </div>
          
          <div class="playlist-actions">
            <button @click="startEdit(playlist.id, playlist.name)" class="action-btn">
              重命名
            </button>
            <button @click="confirmDelete(playlist.id)" class="action-btn delete-btn">
              删除
            </button>
          </div>
        </div>
      </div>
      
      <div class="create-new">
        <input 
          v-model="newPlaylistName" 
          placeholder="新播放列表名称"
          @keyup.enter="createPlaylist"
          class="new-playlist-input"
        />
        <button @click="createPlaylist" class="create-btn">创建</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import type { Playlist } from '../stores/playlistStore';

const props = defineProps<{
  playlists: Playlist[];
}>();

const emit = defineEmits<{
  'close': [];
  'create-playlist': [name: string];
  'rename-playlist': [id: string, newName: string];
  'delete-playlist': [id: string];
}>();

const newPlaylistName = ref('');
const editingPlaylistId = ref<string | null>(null);
const editingPlaylistName = ref('');
const editNameInput = ref<HTMLInputElement | null>(null);

// 创建新播放列表
const createPlaylist = () => {
  if (newPlaylistName.value.trim()) {
    emit('create-playlist', newPlaylistName.value.trim());
    newPlaylistName.value = '';
  }
};

// 开始编辑播放列表名称
const startEdit = (playlistId: string, currentName: string) => {
  editingPlaylistId.value = playlistId;
  editingPlaylistName.value = currentName;
  
  nextTick(() => {
    if (editNameInput.value) {
      editNameInput.value.focus();
      editNameInput.value.select();
    }
  });
};

// 确认重命名
const confirmRename = (playlistId: string) => {
  if (editingPlaylistName.value.trim()) {
    emit('rename-playlist', playlistId, editingPlaylistName.value.trim());
    editingPlaylistId.value = null;
  }
};

// 取消编辑
const cancelEdit = () => {
  editingPlaylistId.value = null;
};

// 确认删除
const confirmDelete = (playlistId: string) => {
  const playlist = props.playlists.find(p => p.id === playlistId);
  if (playlist && confirm(`确定要删除播放列表"${playlist.name}"吗？`)) {
    emit('delete-playlist', playlistId);
  }
};
</script>

<style scoped>
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
  max-height: 90vh;
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
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  max-height: 50vh;
}

.playlist-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  background-color: #f5f5f5;
}

.playlist-info {
  flex: 1;
  min-width: 0;
}

.playlist-name {
  font-weight: 500;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-count {
  font-size: 0.85rem;
  color: #666;
}

.edit-name-input {
  width: 100%;
  padding: 0.25rem;
  border: 1px solid #ddd;
  border-radius: 4px;
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
}

.create-btn:hover {
  background-color: #1ed760;
}
</style>
