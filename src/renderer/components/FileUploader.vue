<template>
  <div class="file-uploader">
    <div 
      class="drop-zone"
      @click="selectFiles"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
      :class="{ active: isDragging }"
    >
      <div class="upload-icon">🎵</div>
      <p class="upload-text">点击选择或拖放音乐文件</p>
      <p class="upload-hint">支持 MP3, WAV, OGG, FLAC, M4A 格式</p>
    </div>
    
    <div v-if="isLoading" class="upload-progress">
      <div class="progress-bar">
        <div 
          class="progress-filled"
          :style="{ width: `${loadingProgress}%` }"
        ></div>
      </div>
      <p class="progress-text">正在处理文件... {{ loadingProgress.toFixed(0) }}%</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useLibraryStore } from '../stores/library'
import { SUPPORTED_AUDIO_FORMATS } from '../../shared/constants'

// 获取音乐库状态
const libraryStore = useLibraryStore()

// 状态
const isDragging = ref(false)
const isLoading = ref(false)
const loadingProgress = ref(0)

// 拖拽处理
const onDragOver = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
  isDragging.value = true
}

const onDragLeave = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
  isDragging.value = false
}

const onDrop = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
  isDragging.value = false
  
  // 检查是否有文件
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    // 获取文件列表
    const files = Array.from(event.dataTransfer.files)
    processFiles(files)
  }
}

// 文件选择处理
async function selectFiles() {
  try {
    const filePaths = await window.electronAPI.selectMusicFiles()
    if (filePaths.length > 0) {
      handleSelectedFiles(filePaths)
    }
  } catch (error) {
    console.error('Failed to select files:', error)
  }
}

// 处理选择的文件
async function handleSelectedFiles(filePaths: string[]) {
  isLoading.value = true
  loadingProgress.value = 0
  
  try {
    const total = filePaths.length
    const tracks = []
    
    for (let i = 0; i < filePaths.length; i++) {
      // 获取音频元数据
      const metadata = await window.electronAPI.getAudioMetadata(filePaths[i])
      
      if (metadata) {
        tracks.push(metadata)
      }
      
      // 更新进度
      loadingProgress.value = ((i + 1) / total) * 100
    }
    
    // 添加到音乐库
    if (tracks.length > 0) {
      libraryStore.addTracks(tracks)
    }
  } catch (error) {
    console.error('Failed to process files:', error)
  } finally {
    isLoading.value = false
  }
}

// 处理文件
async function processFiles(files: File[]) {
  // 过滤支持的文件类型
  const supportedFiles = files.filter(file => {
    const extension = file.name.split('.').pop()?.toLowerCase() || ''
    return SUPPORTED_AUDIO_FORMATS.includes(extension as any)
  })
  
  if (supportedFiles.length === 0) {
    alert('请选择支持的音频文件格式')
    return
  }
  
  // 由于渲染进程无法直接读取文件路径，这里需要先调用主进程接口
  // 在实际应用中，可能需要先将文件保存到临时目录，再处理
  // 对于简化的示例，直接显示警告
  alert('通过拖放添加文件功能在此示例中不可用。请使用"选择文件"按钮。')
}
</script>

<style scoped>
.file-uploader {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.drop-zone {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.drop-zone:hover {
  border-color: #999;
  background-color: #f9f9f9;
}

.drop-zone.active {
  border-color: #4cd964;
  background-color: rgba(76, 217, 100, 0.1);
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.upload-text {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.upload-hint {
  font-size: 0.9rem;
  color: #666;
}

.upload-progress {
  margin-top: 1rem;
}

.progress-bar {
  height: 8px;
  background-color: #ddd;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  overflow: hidden;
}

.progress-filled {
  height: 100%;
  background-color: #4cd964;
  transition: width 0.2s;
}

.progress-text {
  font-size: 0.9rem;
  color: #666;
  text-align: center;
}
</style>