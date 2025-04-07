<template>
  <div class="lyrics-container" :class="{ expanded: isExpanded }">
    <div class="lyrics-header">
      <h3>歌词</h3>
      <button @click="toggleExpand" class="expand-btn">
        {{ isExpanded ? '收起' : '展开' }}
      </button>
    </div>
    
    <div v-if="loading" class="lyrics-loading">
      加载歌词中...
    </div>
    
    <div v-else-if="error" class="lyrics-error">
      {{ error }}
    </div>
    
    <div v-else-if="!lyrics.length" class="lyrics-empty">
      暂无歌词
    </div>
    
    <div v-else ref="lyricsScrollContainer" class="lyrics-content">
      <p 
        v-for="(line, index) in lyrics" 
        :key="index"
        :class="{ active: currentLineIndex === index }"
        ref="lyricLines"
      >
        {{ line.text }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue';
import { usePlayerStore } from '../stores/playerStore';

interface LyricLine {
  time: number;  // 时间戳（秒）
  text: string;  // 歌词文本
}

const props = defineProps<{
  songPath?: string;
}>();

const playerStore = usePlayerStore();
const isExpanded = ref(false);
const loading = ref(false);
const error = ref('');
const lyrics = ref<LyricLine[]>([]);
const currentLineIndex = ref(-1);
const lyricsScrollContainer = ref<HTMLElement | null>(null);
const lyricLines = ref<HTMLElement[]>([]);

// 当前播放时间
const currentTime = computed(() => playerStore.currentTime);

// 切换展开/收起状态
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

// 解析LRC格式歌词
const parseLyrics = (lrcContent: string): LyricLine[] => {
  const lines = lrcContent.split('\n');
  const timeTagRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;
  const result: LyricLine[] = [];
  
  for (const line of lines) {
    const matches = Array.from(line.matchAll(timeTagRegex));
    if (matches.length === 0) continue;
    
    // 提取文本部分（去除时间标签）
    let text = line.replace(timeTagRegex, '').trim();
    if (!text) continue;
    
    // 处理每个时间标签
    for (const match of matches) {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      const milliseconds = parseInt(match[3].padEnd(3, '0').substring(0, 3));
      
      const timeInSeconds = minutes * 60 + seconds + milliseconds / 1000;
      
      result.push({
        time: timeInSeconds,
        text
      });
    }
  }
  
  // 按时间排序
  return result.sort((a, b) => a.time - b.time);
};

// 加载歌词
const loadLyrics = async (songPath: string) => {
  // 重置状态
  lyrics.value = [];
  currentLineIndex.value = -1;
  loading.value = true;
  error.value = '';
  
  try {
    // 尝试从歌曲路径推断歌词文件路径（替换扩展名为.lrc）
    const lrcPath = songPath.replace(/\.[^/.]+$/, ".lrc");
    
    if (window.electronAPI?.readLyricFile) {
      const lrcContent = await window.electronAPI.readLyricFile(lrcPath);
      
      if (lrcContent) {
        lyrics.value = parseLyrics(lrcContent);
      } else {
        error.value = '未找到歌词文件';
      }
    } else {
      error.value = 'Electron API不可用';
    }
  } catch (err) {
    console.error('加载歌词出错:', err);
    error.value = '加载歌词失败';
  } finally {
    loading.value = false;
  }
};

// 更新当前行
const updateCurrentLine = () => {
  if (!lyrics.value.length) return;
  
  const time = currentTime.value;
  let i = 0;
  
  // 找到当前时间对应的歌词行
  for (i = 0; i < lyrics.value.length; i++) {
    if (lyrics.value[i].time > time) {
      break;
    }
  }
  
  // 当前行是前一行
  const newIndex = Math.max(0, i - 1);
  
  // 只有当行号变化时才滚动
  if (currentLineIndex.value !== newIndex) {
    currentLineIndex.value = newIndex;
    scrollToCurrentLine();
  }
};

// 滚动到当前行
const scrollToCurrentLine = () => {
  if (!lyricsScrollContainer.value || !lyricLines.value.length) return;
  
  const container = lyricsScrollContainer.value;
  const currentLine = lyricLines.value[currentLineIndex.value];
  
  if (currentLine) {
    const containerHeight = container.clientHeight;
    const lineTop = currentLine.offsetTop;
    const lineHeight = currentLine.clientHeight;
    
    // 将当前行滚动到容器中央
    container.scrollTop = lineTop - containerHeight / 2 + lineHeight / 2;
  }
};

// 监听props.songPath变化
watch(() => props.songPath, (newPath) => {
  if (newPath) {
    loadLyrics(newPath);
  } else {
    lyrics.value = [];
    error.value = '';
  }
}, { immediate: true });

// 监听播放时间更新当前歌词行
watch(currentTime, () => {
  updateCurrentLine();
});

// 组件卸载时清理
onUnmounted(() => {
  lyrics.value = [];
  currentLineIndex.value = -1;
});
</script>

<style scoped>
.lyrics-container {
  height: 200px;
  border-top: 1px solid #eee;
  padding: 1rem;
  transition: height 0.3s ease;
}

.lyrics-container.expanded {
  height: 400px;
}

.lyrics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.expand-btn {
  background-color: transparent;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
}

.lyrics-content {
  height: calc(100% - 40px);
  overflow-y: auto;
  position: relative;
}

.lyrics-content p {
  padding: 0.5rem 0;
  text-align: center;
  transition: all 0.2s ease;
  color: #666;
}

.lyrics-content p.active {
  color: #1db954;
  font-size: 1.1em;
  font-weight: 500;
}

.lyrics-loading,
.lyrics-error,
.lyrics-empty {
  height: calc(100% - 40px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

.lyrics-error {
  color: #f44336;
}
</style>
