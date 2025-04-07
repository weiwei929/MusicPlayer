# 音乐播放器

一个基于Electron和Vue 3的现代音乐播放器应用，支持本地音乐文件播放和播放列表管理。

## 功能特性

- 🎵 播放本地音乐文件（支持MP3、WAV、FLAC等格式）
- 📋 创建和管理播放列表
- 🔄 音乐文件元数据提取（标题、艺术家、专辑等）
- 📊 音频播放控制（播放/暂停、进度控制、音量调节）
- 📚 音乐库文件管理
- 💾 播放列表和设置的持久化存储

## 技术栈

- **Electron**: 跨平台桌面应用框架
- **Vue 3**: 用于构建用户界面的JavaScript框架
- **TypeScript**: 提供类型安全的JavaScript超集
- **Pinia**: Vue.js的状态管理库
- **Howler.js**: 音频播放库
- **Node-ID3**: 音频元数据解析库

## 开发设置

### 前提条件

- Node.js 14.x或更高版本
- npm 6.x或更高版本

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
# 启动Vite开发服务器
npm run start:vite

# 在另一个终端启动Electron
npm run start:electron
```

### 构建应用

```bash
npm run build
```

## 项目结构

