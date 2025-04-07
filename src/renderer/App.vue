<template>
  <div class="app-container">
    <div class="app-header">
      <h1>音乐播放器</h1>
      <div class="nav-links">
        <a @click="switchView('library')" :class="{ active: currentView === 'library' }">音乐库</a>
        <a @click="switchView('player')" :class="{ active: currentView === 'player' }">播放器</a>
        <a @click="switchView('settings')" :class="{ active: currentView === 'settings' }">设置</a>
      </div>
    </div>
    
    <div class="app-content">
      <component :is="currentViewComponent"></component>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, onMounted } from 'vue';
import LibraryView from './views/Library.vue';
import PlayerView from './views/Player.vue';
import SettingsView from './views/Settings.vue';

const currentView = ref('library');
const currentViewComponent = shallowRef(LibraryView);

const switchView = (view: string) => {
  currentView.value = view;
  
  switch(view) {
    case 'library':
      currentViewComponent.value = LibraryView;
      break;
    case 'player':
      currentViewComponent.value = PlayerView;
      break;
    case 'settings':
      currentViewComponent.value = SettingsView;
      break;
  }
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
  // 使用event代替dragEvent
};

onMounted(() => {
  console.log('应用已加载，Electron API 状态:', window.electronAPI ? '可用' : '不可用');
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  background-color: #f5f5f5;
  color: #333;
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.app-header {
  background-color: #333;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-links a {
  color: #ddd;
  cursor: pointer;
  padding: 0.5rem 0;
  text-decoration: none;
}

.nav-links a:hover {
  color: white;
}

.nav-links a.active {
  color: #1db954;
  border-bottom: 2px solid #1db954;
}

.app-content {
  flex: 1;
  overflow: auto;
  padding: 1rem;
}
</style>