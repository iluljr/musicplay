import { backendApi } from '@/services/backendApi'
import { bindPlayerController, setPlayerStoreState, type PlayerController } from '@/stores/playerStore'
import { useLibraryStore } from '@/stores/libraryStore'
import { usePlaylistStore } from '@/stores/playlistStore'
import type { PlaybackStatus } from '@/types/player'
import type { Playlist } from '@/types/playlist'
import type { Song } from '@/types/song'

type PlayerSnapshot = {
  activeSongId: string | null
  activeIndex: number
  queueSongIds: string[]
  playbackStatus: PlaybackStatus
  currentTime: number
  duration: number
  isShuffleEnabled: boolean
  repeatMode: 'off' | 'all' | 'one'
  volume: number
  playbackRate: number
  error: string | null
  updatedAt: string
}

type SocketMessage =
  | { type: 'bootstrap'; songs: Song[]; playlists: Playlist[]; playerState: PlayerSnapshot }
  | { type: 'songs_updated'; songs: Song[] }
  | { type: 'playlists_updated'; playlists: Playlist[] }
  | { type: 'player_state'; playerState: PlayerSnapshot }

class PlayerGateway {
  private socket: WebSocket | null = null
  private isConnected = false
  private reconnectTimer: number | null = null
  private mounted = false
  private readonly controller: PlayerController & {
    toggleShuffle: () => void
    cycleRepeatMode: () => void
  }

  constructor() {
    this.controller = {
      play: () => this.send({ type: 'command', command: 'play' }),
      pause: () => this.send({ type: 'command', command: 'pause' }),
      stop: () => this.send({ type: 'command', command: 'stop' }),
      previous: () => this.send({ type: 'command', command: 'previous' }),
      next: () => this.send({ type: 'command', command: 'next' }),
      playTrackAtIndex: (index) => {
        const song = useLibraryStore.getState().songs[index]
        if (!song) return
        this.send({ type: 'command', command: 'playSongId', songId: song.id })
      },
      seek: (timeInSeconds) => this.send({ type: 'command', command: 'seek', value: timeInSeconds }),
      setVolume: (volume) => this.send({ type: 'command', command: 'volume', value: volume }),
      setPlaybackRate: (playbackRate) =>
        this.send({ type: 'command', command: 'playbackRate', value: playbackRate }),
      toggleShuffle: () => this.send({ type: 'command', command: 'shuffle' }),
      cycleRepeatMode: () => this.send({ type: 'command', command: 'repeat' }),
    }
  }

  connect() {
    if (this.socket || this.isConnected) {
      return
    }

    bindPlayerController(this.controller)
    this.mounted = true
    this.socket = new WebSocket(backendApi.wsUrl)

    this.socket.addEventListener('open', () => {
      this.isConnected = true
    })

    this.socket.addEventListener('message', (event) => {
      const message = JSON.parse(String(event.data)) as SocketMessage
      this.handleMessage(message)
    })

    this.socket.addEventListener('close', () => {
      this.socket = null
      this.isConnected = false
      if (!this.mounted) return
      this.reconnectTimer = window.setTimeout(() => this.connect(), 1200)
    })
  }

  disconnect() {
    this.mounted = false
    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.socket?.close()
    this.socket = null
    this.isConnected = false
  }

  sendTelemetry(payload: {
    currentTime: number
    duration: number
    playbackStatus: PlaybackStatus
  }) {
    this.send({ type: 'telemetry', ...payload })
  }

  private send(payload: unknown) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return
    }
    this.socket.send(JSON.stringify(payload))
  }

  private handleMessage(message: SocketMessage) {
    if (message.type === 'bootstrap') {
      const normalizedSongs = message.songs.map(backendApi.normalizeSong)
      useLibraryStore.getState().setSongs(normalizedSongs)
      useLibraryStore.getState().setLoading(false)
      usePlaylistStore.getState().setPlaylists(message.playlists)
      usePlaylistStore.getState().setLoading(false)
      this.applyPlayerState(message.playerState, normalizedSongs)
      return
    }

    if (message.type === 'songs_updated') {
      const normalizedSongs = message.songs.map(backendApi.normalizeSong)
      useLibraryStore.getState().setSongs(normalizedSongs)
      setPlayerStoreState({
        tracks: normalizedSongs,
      })
      return
    }

    if (message.type === 'playlists_updated') {
      usePlaylistStore.getState().setPlaylists(message.playlists)
      return
    }

    if (message.type === 'player_state') {
      this.applyPlayerState(message.playerState)
    }
  }

  private applyPlayerState(snapshot: PlayerSnapshot | null, songs = useLibraryStore.getState().songs) {
    if (!snapshot) return

    const nextActiveIndex =
      snapshot.activeSongId
        ? songs.findIndex((song) => song.id === snapshot.activeSongId)
        : snapshot.activeIndex

    setPlayerStoreState({
      tracks: songs,
      activeIndex: nextActiveIndex >= 0 ? nextActiveIndex : 0,
      queueSongIds: snapshot.queueSongIds,
      playbackStatus: snapshot.playbackStatus,
      currentTime: snapshot.currentTime,
      duration: snapshot.duration,
      isShuffleEnabled: snapshot.isShuffleEnabled,
      repeatMode: snapshot.repeatMode,
      volume: snapshot.volume,
      playbackRate: snapshot.playbackRate,
      isReady: snapshot.duration > 0,
      error: snapshot.error,
    })
  }
}

export const playerGateway = new PlayerGateway()
