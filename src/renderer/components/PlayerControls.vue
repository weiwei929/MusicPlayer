<template>
  <div class="player-controls">
    <!-- 歌曲信息 -->
    <div class="track-info">
      <div v-if="currentTrack" class="track-details">
        <img 
          v-if="currentTrack.coverArt" 
          :src="currentTrack.coverArt" 
          alt="封面" 
          class="cover-art"
        >
        <div v-else class="cover-placeholder">
          <i class="icon">🎵</i>
        </div>
        <div class="track-text">
          <div class="track-title">{{ currentTrack.title }}</div>
          <div class="track-artist">{{ currentTrack.artist || '未知艺术家' }}</div>
        </div>
      </div>
      <div v-else class="no-track">
        <span>未选择音乐</span>
      </div>
    </div>
    
    <!-- 播放控制栏 -->
    <div class="controls">
      <!-- 随机播放按钮 -->
      <button 
        @click="playerStore.toggleShuffle"
        :class="['control-btn', { active: playerStore.shuffle }]"
        title="随机播放"
      >
        🔀
      </button>
      
      <!-- 上一曲按钮 -->
      <button 
        @click="playerStore.playPrevious"
        class="control-btn"
        title="上一曲"
        :disabled="!currentTrack"
      >
        ⏮️
      </button>
      
      <!-- 播放/暂停按钮 -->
      <button 
        @click="playerStore.togglePlay"
        class="control-btn play-btn"
        :title="isPlaying ? '暂停' : '播放'"
      >
        {{ isPlaying ? '⏸️' : '▶️' }}
      </button>
      
      <!-- 下一曲按钮 -->
      <button 
        @click="playerStore.playNext"
        class="control-btn"
        title="下一曲"
        :disabled="!currentTrack"
      >
        ⏭️
      </button>
      
      <!-- 循环按钮 -->
      <button 
        @click="playerStore.toggleRepeat"
        :class="['control-btn', { active: playerStore.repeat }]"
        title="循环播放"
      >
        🔁
      </button>
    </div>
    
    <!-- 进度条 -->
    <div class="progress-container">
      <span class="time">{{ playerStore.formattedCurrentTime }}</span>
      <div 
        class="progress-bar"
        @click="onProgressBarClick"
      >
        <div 
          class="progress-filled"
          :style="{ width: `${playerStore.progressPercentage}%` }"
        ></div>
      </div>
      <span class="time">{{ playerStore.formattedDuration }}</span>
    </div>
    
    <!-- 音量控制 -->
    <div class="volume-container">
      <button 
        @click="playerStore.toggleMute"
        class="control-btn"
        title="静音"
      >
        {{ playerStore.muted ? '🔇' : '🔊' }}
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        v-model="volume"
        class="volume-slider"
        @input="onVolumeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { usePlayerStore } from '../stores/player'
import { PlayerState } from '../types'

// 获取播放器状态
const playerStore = usePlayerStore()

// 计算属性：当前播放曲目
const currentTrack = computed(() => playerStore.currentTrack)

// 计算属性：是否正在播放
const isPlaying = computed(() => playerStore.playerState === PlayerState.PLAYING)

// 音量响应式引用
const volume = ref(playerStore.volume)

// 监听播放器音量变化
watch(() => playerStore.volume, (newVolume) => {
  volume.value = newVolume
})

// 处理音量滑块变化
function onVolumeChange() {
  playerStore.setVolume(volume.value)
}

// 处理进度条点击
function onProgressBarClick(event: MouseEvent) {
  const progressBar = event.currentTarget as HTMLElement
  const rect = progressBar.getBoundingClientRect()
  const offsetX = event.clientX - rect.left
  const percentage = (offsetX / rect.width) * 100
  playerStore.seekToPercentage(percentage)
}
</script>

<style scoped>
.player-controls {
  display: flex;
  flex-direction: column;
  padding: 0.5rem 1rem;
}

.track-info {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.track-details {
  display: flex;
  align-items: center;
}

.cover-art, .cover-placeholder {
  width: 40px;
  height: 40px;
  margin-right: 10px;
  border-radius: 4px;
}

.cover-placeholder {
  background-color: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
}

.track-text {
  display: flex;
  flex-direction: column;
}

.track-title {
  font-weight: bold;
}

.track-artist {
  font-size: 0.8rem;
  color: #666;
}

.no-track {
  color: #999;
  font-style: italic;
}

.controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 0.5rem;
}

.control-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.control-btn:hover {
  background-color: #f0f0f0;
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.control-btn.active {
  color: #4cd964;
}

.play-btn {
  font-size: 1.5rem;
  margin: 0 0.5rem;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.time {
  font-size: 0.8rem;
  color: #666;
  min-width: 2.5rem;
}

.progress-bar {
  flex: 1;
  height: 5px;
  background-color: #ddd;
  border-radius: 3px;
  cursor: pointer;
  position: relative;
}

.progress-filled {
  height: 100%;
  background-color: #4cd964;
  border-radius: 3px;
  position: absolute;
  top: 0;
  left: 0;
}

.volume-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.volume-slider {
  -webkit-appearance: none;
  width: 80px;
  height: 4px;
  background: #ddd;
  border-radius: 2px;
  outline: none;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #4cd964;
  cursor: pointer;
}
</style>