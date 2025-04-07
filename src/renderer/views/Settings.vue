<template>
  <div class="settings-container">
    <h2>设置</h2>
    
    <div class="settings-section">
      <h3>音乐库设置</h3>
      <div class="setting-item">
        <label>默认音乐文件夹</label>
        <div class="folder-selector">
          <input type="text" v-model="settings.musicFolder" readonly />
          <button @click="selectFolder">浏览...</button>
        </div>
      </div>
      
      <div class="setting-item">
        <label>
          <input type="checkbox" v-model="settings.scanSubfolders" />
          扫描子文件夹
        </label>
      </div>
      
      <div class="setting-item">
        <label>支持的文件格式</label>
        <div class="checkbox-group">
          <label v-for="format in availableFormats" :key="format.value">
            <input 
              type="checkbox"
              :value="format.value"
              v-model="settings.supportedFormats"
            />
            {{ format.label }}
          </label>
        </div>
      </div>
    </div>
    
    <div class="settings-section">
      <h3>播放设置</h3>
      <div class="setting-item">
        <label>
          <input type="checkbox" v-model="settings.autoPlay" />
          自动播放
        </label>
      </div>
      
      <div class="setting-item">
        <label>默认音量</label>
        <input 
          type="range" 
          min="0" 
          max="100" 
          v-model="settings.defaultVolume"
        />
        <span>{{ settings.defaultVolume }}%</span>
      </div>
      
      <div class="setting-item">
        <label>
          <input type="checkbox" v-model="settings.rememberPlaybackPosition" />
          记住播放位置
        </label>
      </div>
    </div>
    
    <div class="settings-actions">
      <button class="save-button" @click="saveSettings">保存设置</button>
      <button @click="resetSettings">恢复默认</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';

// 可用的音频格式
const availableFormats = [
  { label: 'MP3', value: 'mp3' },
  { label: 'FLAC', value: 'flac' },
  { label: 'WAV', value: 'wav' },
  { label: 'AAC', value: 'aac' },
  { label: 'OGG', value: 'ogg' }
];

// 设置状态
const settings = reactive({
  musicFolder: '',
  scanSubfolders: true,
  supportedFormats: ['mp3', 'flac', 'wav'],
  autoPlay: false,
  defaultVolume: 50,
  rememberPlaybackPosition: true
});

// 加载设置
const loadSettings = async () => {
  try {
    if (window.electronAPI?.getSettings) {
      const savedSettings = await window.electronAPI.getSettings();
      if (savedSettings) {
        Object.assign(settings, savedSettings);
      }
    }
  } catch (error) {
    console.error('加载设置失败:', error);
  }
};

// 选择文件夹
const selectFolder = async () => {
  try {
    if (window.electronAPI?.selectFolder) {
      const result = await window.electronAPI.selectFolder();
      if (result && !result.canceled && result.filePaths.length > 0) {
        settings.musicFolder = result.filePaths[0];
      }
    } else {
      console.error('Electron API不可用');
      alert('无法选择文件夹，Electron API不可用');
    }
  } catch (error) {
    console.error('选择文件夹失败:', error);
    alert('选择文件夹时出错');
  }
};

// 如果有任何拖放相关代码，修复它们
const handleFolderDrop = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
  
  // 使用正确的事件对象
  if (event.dataTransfer?.files.length) {
    // 处理文件...
  }
};

// 保存设置
const saveSettings = async () => {
  try {
    if (window.electronAPI?.saveSettings) {
      await window.electronAPI.saveSettings(settings);
    } else {
      localStorage.setItem('musicPlayerSettings', JSON.stringify(settings));
    }
    ElMessage.success('设置已保存');
  } catch (error) {
    console.error('保存设置时出错:', error);
    ElMessage.error('保存设置时出错');
  }
};

// 重置设置
const resetSettings = () => {
  Object.assign(settings, {
    musicFolder: '',
    scanSubfolders: true,
    supportedFormats: ['mp3', 'flac', 'wav'],
    autoPlay: false,
    defaultVolume: 50,
    rememberPlaybackPosition: true
  });
  ElMessage.info('已恢复默认设置（尚未保存）');
};

onMounted(() => {
  loadSettings();
});
</script>

<style scoped>
.settings-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.settings-section {
  margin-bottom: 20px;
}

.setting-item {
  margin-bottom: 10px;
}

.folder-selector {
  display: flex;
  gap: 10px;
}

.folder-selector input {
  flex: 1;
}

.settings-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style>
