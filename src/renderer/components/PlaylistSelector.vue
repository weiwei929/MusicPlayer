<template>
  <div class="playlist-selector">
    <div class="selector-header">
      <h3>播放列表</h3>
      <div class="selector-actions">
        <button @click="showCreateInput = true" class="create-btn" v-if="!showCreateInput">
          <span>+</span>
        </button>
        <button @click="$emit('manage-playlists')" class="manage-btn">
          管理
        </button>
      </div>
    </div>
    
    <div v-if="showCreateInput" class="playlist-create">
      <input 
        v-model="newPlaylistName" 
        placeholder="播放列表名称"
        ref="createInput"
        @keyup.enter="createPlaylist"
        @keyup.esc="cancelCreate"
      />
      <div class="create-actions">
        <button @click="createPlaylist" class="confirm-btn">创建</button>
        <button @click="cancelCreate" class="cancel-btn">取消</button>
      </div>
    </div>
    
    <div class="playlist-dropdown">
      <select v-model="selectedId" @change="selectPlaylist" class="playlist-select">
        <option v-for="playlist in playlists" :key="playlist.id" :value="playlist.id">
          {{ playlist.name }} ({{ playlist.songs.length }})
        </option>
        <option v-if="playlists.length === 0" disabled>无播放列表</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import type { Playlist } from '../stores/playlistStore';

const props = defineProps<{
  playlists: Playlist[];
  selectedPlaylistId: string | null;
}>();

const emit = defineEmits<{
  'select-playlist': [playlistId: string];
  'create-playlist': [name: string];
  'manage-playlists': [];
}>();

const selectedId = ref(props.selectedPlaylistId);
const showCreateInput = ref(false);
const newPlaylistName = ref('');
const createInput = ref<HTMLInputElement | null>(null);

// 当外部选中的播放列表ID变化时，更新本地状态
watch(() => props.selectedPlaylistId, (newId) => {
  selectedId.value = newId;
});

// 选择播放列表
const selectPlaylist = () => {
  if (selectedId.value) {
    emit('select-playlist', selectedId.value);
  }
};

// 创建播放列表
const createPlaylist = () => {
  if (newPlaylistName.value.trim()) {
    emit('create-playlist', newPlaylistName.value.trim());
    newPlaylistName.value = '';
    showCreateInput.value = false;
  }
};

// 取消创建
const cancelCreate = () => {
  newPlaylistName.value = '';
  showCreateInput.value = false;
};

// 当显示创建输入框时，自动聚焦
watch(showCreateInput, (show) => {
  if (show) {
    nextTick(() => {
      createInput.value?.focus();
    });
  }
});
</script>

<style scoped>
.playlist-selector {
  margin-bottom: 1rem;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.selector-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.selector-actions {
  display: flex;
  gap: 0.5rem;
}

.create-btn, .manage-btn {
  background: none;
  border: none;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666;
  border-radius: 4px;
}

.create-btn {
  font-size: 18px;
  background-color: #f0f0f0;
}

.create-btn:hover, .manage-btn:hover {
  background-color: #e0e0e0;
  color: #333;
}

.playlist-dropdown {
  margin-bottom: 1rem;
}

.playlist-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  font-size: 1rem;
}

.playlist-create {
  margin-bottom: 1rem;
}

.playlist-create input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.create-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.confirm-btn, .cancel-btn {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
}

.confirm-btn {
  background-color: #1db954;
  color: white;
  border: none;
}

.cancel-btn {
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  color: #333;
}

.confirm-btn:hover {
  background-color: #1ed760;
}

.cancel-btn:hover {
  background-color: #e0e0e0;
}
</style>
