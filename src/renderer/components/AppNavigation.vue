<template>
  <div class="app-navigation">
    <el-menu
      :default-active="activeRoute"
      class="nav-menu"
      router
      mode="horizontal"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b"
    >
      <el-menu-item :index="ROUTES.LIBRARY">
        <el-icon><document /></el-icon>
        <span>音乐库</span>
      </el-menu-item>
      <el-menu-item :index="ROUTES.PLAYER">
        <el-icon><video-play /></el-icon>
        <span>播放器</span>
      </el-menu-item>
      <el-menu-item :index="ROUTES.SETTINGS">
        <el-icon><setting /></el-icon>
        <span>设置</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Document, VideoPlay, Setting } from '@element-plus/icons-vue';
import { ROUTES } from '../../shared/constants';

const route = useRoute();

const activeRoute = computed(() => {
  return route.path;
});
</script>

<style scoped>
.app-navigation {
  margin-bottom: 20px;
}

.nav-menu {
  display: flex;
  justify-content: center;
}
</style>
