import { defineStore } from 'pinia';
import { Track, Album, Artist, Playlist, LibraryState } from '../types';
// 修正导入方式
import ElectronStore from 'electron-store';
import { ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants';

// 初始化状态
const initialState: LibraryState = {
  tracks: [],
  albums: [],
  artists: [],
  playlists: [],
  isLoading: false,
  error: null
};

// 创建存储
export const useLibraryStore = defineStore('library', {
  state: () => initialState,

  getters: {
    // 获取曲目数量
    trackCount: (state) => state.tracks.length,

    // 获取专辑数量
    albumCount: (state) => state.albums.length,

    // 获取艺术家数量
    artistCount: (state) => state.artists.length,

    // 获取播放列表数量
    playlistCount: (state) => state.playlists.length,

    // 根据ID获取曲目
    getTrackById: (state) => (id: string) => state.tracks.find(track => track.id === id),

    // 根据ID获取专辑
    getAlbumById: (state) => (id: string) => state.albums.find(album => album.id === id),

    // 根据ID获取艺术家
    getArtistById: (state) => (id: string) => state.artists.find(artist => artist.id === id),

    // 根据ID获取播放列表
    getPlaylistById: (state) => (id: string) => state.playlists.find(playlist => playlist.id === id),
  },

  actions: {
    // 设置加载状态
    setLoading(isLoading: boolean) {
      this.isLoading = isLoading;
    },

    // 设置错误
    setError(error: string | null) {
      this.error = error;
    },

    // 添加曲目
    addTracks(newTracks: Track[]) {
      // 避免重复
      const uniqueTracks = newTracks.filter(
        newTrack => !this.tracks.some(track => track.path === newTrack.path)
      );

      this.tracks.push(...uniqueTracks);
      this.organizeLibrary();
      this.saveLibrary();
    },

    // 从音乐库中删除曲目
    removeTrack(id: string) {
      this.tracks = this.tracks.filter(track => track.id !== id);
      this.organizeLibrary();
      this.saveLibrary();
    },

    // 创建播放列表
    createPlaylist(name: string, description: string = '') {
      const newPlaylist: Playlist = {
        id: this.generateId(),
        name,
        description,
        tracks: [],
        coverArt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.playlists.push(newPlaylist);
      this.saveLibrary();
      return newPlaylist.id;
    },

    // 向播放列表添加曲目
    addTracksToPlaylist(playlistId: string, trackIds: string[]) {
      const playlist = this.playlists.find(p => p.id === playlistId);
      if (!playlist) return;

      const tracksToAdd = this.tracks.filter(track => trackIds.includes(track.id));

      // 避免重复
      for (const track of tracksToAdd) {
        if (!playlist.tracks.some(t => t.id === track.id)) {
          playlist.tracks.push(track);
        }
      }

      playlist.updatedAt = new Date();
      this.saveLibrary();
    },

    // 从播放列表中删除曲目
    removeTrackFromPlaylist(playlistId: string, trackId: string) {
      const playlist = this.playlists.find(p => p.id === playlistId);
      if (!playlist) return;

      playlist.tracks = playlist.tracks.filter(track => track.id !== trackId);
      playlist.updatedAt = new Date();
      this.saveLibrary();
    },

    // 删除播放列表
    removePlaylist(playlistId: string) {
      this.playlists = this.playlists.filter(playlist => playlist.id !== playlistId);
      this.saveLibrary();
    },

    // 组织音乐库（整理专辑和艺术家）
    organizeLibrary() {
      // 重新生成专辑列表
      const albumMap = new Map<string, Album>();

      for (const track of this.tracks) {
        const albumKey = `${track.album}-${track.artist}`;

        if (!albumMap.has(albumKey)) {
          albumMap.set(albumKey, {
            id: this.generateId(),
            name: track.album,
            artist: track.artist,
            year: track.year,
            coverArt: track.coverArt,
            tracks: []
          });
        }

        const album = albumMap.get(albumKey);
        if (album) {
          album.tracks.push(track);

          // 如果当前曲目有封面但专辑没有，使用曲目的封面
          if (!album.coverArt && track.coverArt) {
            album.coverArt = track.coverArt;
          }
        }
      }

      this.albums = Array.from(albumMap.values());

      // 重新生成艺术家列表
      const artistMap = new Map<string, Artist>();

      for (const album of this.albums) {
        if (!artistMap.has(album.artist)) {
          artistMap.set(album.artist, {
            id: this.generateId(),
            name: album.artist,
            albums: [],
            genres: []
          });
        }

        const artist = artistMap.get(album.artist);
        if (artist) {
          artist.albums.push(album);

          // 收集该艺术家的所有曲目流派
          for (const track of album.tracks) {
            if (track.genre && !artist.genres?.includes(track.genre)) {
              artist.genres = [...(artist.genres || []), track.genre];
            }
          }

          // 如果当前专辑有封面但艺术家没有图片，使用专辑的封面
          if (!artist.image && album.coverArt) {
            artist.image = album.coverArt;
          }
        }
      }

      this.artists = Array.from(artistMap.values());
    },

    // 保存音乐库到本地存储
    saveLibrary() {
      // 在实际应用中，应该使用适当的持久化方法
      try {
        localStorage.setItem('music_library', JSON.stringify({
          tracks: this.tracks,
          playlists: this.playlists
        }));
      } catch (error) {
        console.error('保存音乐库时出错:', error);
        this.setError('无法保存音乐库');
      }
    },

    // 从本地存储加载音乐库
    loadLibrary() {
      this.setLoading(true);
      this.setError(null);

      try {
        const libraryData = localStorage.getItem('music_library');

        if (libraryData) {
          const { tracks, playlists } = JSON.parse(libraryData);

          // 恢复日期对象
          if (tracks) {
            this.tracks = tracks.map((track: any) => ({
              ...track,
              added: track.added ? new Date(track.added) : undefined,
              lastPlayed: track.lastPlayed ? new Date(track.lastPlayed) : undefined
            }));
          }

          if (playlists) {
            this.playlists = playlists.map((playlist: any) => ({
              ...playlist,
              createdAt: new Date(playlist.createdAt),
              updatedAt: new Date(playlist.updatedAt)
            }));
          }

          this.organizeLibrary();
        }
      } catch (error) {
        console.error('加载音乐库时出错:', error);
        this.setError('无法加载音乐库');
      } finally {
        this.setLoading(false);
      }
    },

    // 生成唯一ID
    generateId(): string {
      return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
  }
});

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  path: string;
  duration?: number;
  cover?: string;
}

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
}

export const usePlaylistStore = defineStore('playlist', () => {
  // 播放列表
  const playlists = ref<Playlist[]>([]);
  const currentPlaylistId = ref<string | null>(null);

  // 所有歌曲的库
  const library = ref<Song[]>([]);

  // 计算属性：当前播放列表
  const currentPlaylist = computed(() => {
    if (!currentPlaylistId.value) return null;
    return playlists.value.find(playlist => playlist.id === currentPlaylistId.value) || null;
  });

  // 添加到库
  const addToLibrary = (songs: Song[]) => {
    // 防止重复添加
    const newSongs = songs.filter(song =>
      !library.value.some(existingSong => existingSong.path === song.path)
    );

    library.value.push(...newSongs);

    // 保存库
    saveLibraryToStorage();
    // 不需要在这里调用 savePlaylistsToStorage，因为库和播放列表是分开存储的
  };

  // 保存库到存储
  const saveLibraryToStorage = () => {
    try {
      if (window.electronAPI?.saveUserData) {
        // 创建一个可序列化的副本
        const serializableLibrary = library.value.map(song => ({
          id: song.id,
          title: song.title,
          artist: song.artist,
          album: song.album,
          path: song.path,
          duration: song.duration,
          cover: song.cover
        }));

        window.electronAPI.saveUserData('musicLibrary', serializableLibrary);
      } else {
        // 备选方案：使用localStorage
        const serializableLibrary = JSON.parse(JSON.stringify(library.value));
        localStorage.setItem('musicPlayer_library', JSON.stringify(serializableLibrary));
      }
    } catch (error) {
      console.error('保存音乐库失败:', error);
    }
  };

  // 从存储加载库
  const loadLibraryFromStorage = async () => {
    try {
      let savedLibrary = null;

      if (window.electronAPI?.getUserData) {
        savedLibrary = await window.electronAPI.getUserData('musicLibrary');
      } else {
        // 备选方案：使用localStorage
        const data = localStorage.getItem('musicPlayer_library');
        if (data) {
          savedLibrary = JSON.parse(data);
        }
      }

      if (savedLibrary && Array.isArray(savedLibrary)) {
        library.value = savedLibrary;
      }
    } catch (error) {
      console.error('加载音乐库失败:', error);
    }
  };

  // 初始化时加载库
  loadLibraryFromStorage();

  // 创建播放列表
  const createPlaylist = (name: string): string => {
    const id = Date.now().toString();
    playlists.value.push({
      id,
      name,
      songs: []
    });
    savePlaylistsToStorage();
    return id;
  };

  // 重命名播放列表
  const renamePlaylist = (playlistId: string, newName: string) => {
    const playlist = playlists.value.find(p => p.id === playlistId);
    if (playlist) {
      playlist.name = newName;
      savePlaylistsToStorage();
    }
  };

  // 删除播放列表
  const removePlaylist = (playlistId: string) => {
    const index = playlists.value.findIndex(playlist => playlist.id === playlistId);
    if (index !== -1) {
      playlists.value.splice(index, 1);

      // 如果删除的是当前播放列表，重置当前播放列表
      if (currentPlaylistId.value === playlistId) {
        currentPlaylistId.value = null;
      }

      savePlaylistsToStorage();
    }
  };

  // 添加到播放列表
  const addToPlaylist = (playlistId: string, songs: Song[]) => {
    const playlist = playlists.value.find(p => p.id === playlistId);
    if (playlist) {
      // 过滤掉已经在播放列表中的歌曲
      const newSongs = songs.filter(song =>
        !playlist.songs.some(existingSong => existingSong.id === song.id)
      );

      playlist.songs.push(...newSongs);
      savePlaylistsToStorage();
    }
  };

  // 从播放列表中移除
  const removeFromPlaylist = (playlistId: string, songId: string) => {
    const playlist = playlists.value.find(p => p.id === playlistId);
    if (playlist) {
      const index = playlist.songs.findIndex(song => song.id === songId);
      if (index !== -1) {
        playlist.songs.splice(index, 1);
        savePlaylistsToStorage();
      }
    }
  };

  // 设置当前播放列表
  const setCurrentPlaylist = (playlistId: string | null) => {
    currentPlaylistId.value = playlistId;
  };

  // 保存到存储
  const savePlaylistsToStorage = () => {
    try {
      if (window.electronAPI?.saveUserData) {
        // 创建一个可序列化的副本
        const serializablePlaylists = playlists.value.map(playlist => ({
          id: playlist.id,
          name: playlist.name,
          songs: playlist.songs.map(song => ({
            id: song.id,
            title: song.title,
            artist: song.artist,
            album: song.album,
            path: song.path,
            duration: song.duration,
            // 如果 cover 是 Blob 或 File 对象，可能需要特殊处理
            // 这里假设 cover 是字符串 (data URL)
            cover: song.cover
          }))
        }));

        window.electronAPI.saveUserData('playlists', serializablePlaylists);
      } else {
        // 备选方案：使用localStorage
        // 同样需要确保可序列化
        const serializablePlaylists = JSON.parse(JSON.stringify(playlists.value));
        localStorage.setItem('musicPlayer_playlists', JSON.stringify(serializablePlaylists));
      }
    } catch (error) {
      console.error('保存播放列表失败:', error);
    }
  };

  // 从存储加载
  const loadPlaylistsFromStorage = async () => {
    try {
      let savedPlaylists = null;

      if (window.electronAPI?.getUserData) {
        savedPlaylists = await window.electronAPI.getUserData('playlists');
      } else {
        // 备选方案：使用localStorage
        const data = localStorage.getItem('musicPlayer_playlists');
        if (data) {
          savedPlaylists = JSON.parse(data);
        }
      }

      if (savedPlaylists && Array.isArray(savedPlaylists)) {
        playlists.value = savedPlaylists;
      }
    } catch (error) {
      console.error('加载播放列表失败:', error);
    }
  };

  // 初始化时加载播放列表
  loadPlaylistsFromStorage();

  return {
    playlists,
    currentPlaylistId,
    library,
    currentPlaylist,
    addToLibrary,
    createPlaylist,
    renamePlaylist,
    removePlaylist,
    addToPlaylist,
    removeFromPlaylist,
    setCurrentPlaylist,
    loadPlaylistsFromStorage,
    savePlaylistsToStorage,
    saveLibraryToStorage,
    loadLibraryFromStorage
  };
});
