import type { PlaybackStatus, PlayerCommandMessage, PlayerState, RepeatMode, Song } from './types.js'

type Broadcast = (playerState: PlayerState) => void

const nowIso = () => new Date().toISOString()

const shuffleArray = <T>(items: T[]) => {
  const nextItems = [...items]

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[nextItems[index], nextItems[swapIndex]] = [nextItems[swapIndex], nextItems[index]]
  }

  return nextItems
}

export class PlayerStateManager {
  private state: PlayerState = {
    activeSongId: null,
    activeIndex: 0,
    queueSongIds: [],
    playbackStatus: 'idle',
    currentTime: 0,
    duration: 0,
    isShuffleEnabled: false,
    repeatMode: 'all',
    volume: 72,
    playbackRate: 1,
    error: null,
    updatedAt: nowIso(),
  }

  private songs: Song[] = []
  private listeners = new Set<Broadcast>()

  private createSequentialQueueSongIds() {
    return this.songs.map((song) => song.id)
  }

  private createShuffleQueueSongIds(currentSongId: string | null) {
    const songIds = this.songs.map((song) => song.id)

    if (songIds.length <= 1) {
      return songIds
    }

    const fallbackSongId = currentSongId && songIds.includes(currentSongId)
      ? currentSongId
      : songIds[0]
    const remainingSongIds = shuffleArray(
      songIds.filter((songId) => songId !== fallbackSongId),
    )

    return [fallbackSongId, ...remainingSongIds]
  }

  setSongs(songs: Song[]) {
    this.songs = songs
    const previousSongId = this.state.activeSongId
    const nextSongIds = songs.map((song) => song.id)
    const previousQueueSongIds = this.state.queueSongIds.filter((songId) =>
      nextSongIds.includes(songId),
    )

    this.state.queueSongIds = this.state.isShuffleEnabled
      ? [
          ...previousQueueSongIds,
          ...nextSongIds.filter((songId) => !previousQueueSongIds.includes(songId)),
        ]
      : nextSongIds
    const nextIndex = previousSongId ? songs.findIndex((song) => song.id === previousSongId) : 0
    this.state.activeIndex = nextIndex >= 0 ? nextIndex : 0
    this.state.activeSongId = songs[this.state.activeIndex]?.id ?? null
    this.state.duration = songs[this.state.activeIndex]?.duration ?? 0
    this.state.updatedAt = nowIso()
    this.emit()
  }

  subscribe(listener: Broadcast) {
    this.listeners.add(listener)
    listener(this.state)
    return () => this.listeners.delete(listener)
  }

  getState() {
    return this.state
  }

  reset() {
    this.state = {
      activeSongId: this.songs[0]?.id ?? null,
      activeIndex: 0,
      queueSongIds: this.createSequentialQueueSongIds(),
      playbackStatus: 'idle',
      currentTime: 0,
      duration: this.songs[0]?.duration ?? 0,
      isShuffleEnabled: false,
      repeatMode: 'all',
      volume: 72,
      playbackRate: 1,
      error: null,
      updatedAt: nowIso(),
    }
    this.emit()
  }

  handle(message: PlayerCommandMessage) {
    if (message.type === 'telemetry') {
      this.state.duration = message.duration || this.state.duration

      if (
        this.state.playbackStatus === 'stopped' &&
        message.playbackStatus === 'paused' &&
        message.currentTime <= 0.05
      ) {
        this.state.updatedAt = nowIso()
        this.emit()
        return
      }

      if (message.playbackStatus === 'ended') {
        this.handleEndedPlayback()
        this.state.updatedAt = nowIso()
        this.emit()
        return
      }

      this.state.currentTime = Math.max(
        0,
        Math.min(message.currentTime, this.state.duration || message.currentTime),
      )
      this.state.playbackStatus = message.playbackStatus
      this.state.updatedAt = nowIso()
      this.emit()
      return
    }

    switch (message.command) {
      case 'play':
        this.state.playbackStatus = 'playing'
        break
      case 'pause':
        this.state.playbackStatus = 'paused'
        break
      case 'stop':
        this.state.playbackStatus = 'stopped'
        this.state.currentTime = 0
        break
      case 'next':
        this.move(1)
        break
      case 'previous':
        this.move(-1)
        break
      case 'seek':
        this.state.currentTime = Math.max(0, Math.min(message.value, this.state.duration || 0))
        break
      case 'volume':
        this.state.volume = Math.max(0, Math.min(message.value, 100))
        break
      case 'playbackRate':
        this.state.playbackRate = Math.max(0.5, Math.min(message.value, 2))
        break
      case 'shuffle':
        this.state.isShuffleEnabled = !this.state.isShuffleEnabled
        this.state.queueSongIds = this.state.isShuffleEnabled
          ? this.createShuffleQueueSongIds(this.state.activeSongId)
          : this.createSequentialQueueSongIds()
        break
      case 'repeat':
        this.state.repeatMode = this.nextRepeatMode(this.state.repeatMode)
        break
      case 'playSongId': {
        const nextIndex = this.songs.findIndex((song) => song.id === message.songId)
        if (nextIndex >= 0) {
          this.state.activeIndex = nextIndex
          this.state.activeSongId = this.songs[nextIndex].id
          this.state.duration = this.songs[nextIndex].duration
          this.state.currentTime = 0
          this.state.playbackStatus = 'playing'
        }
        break
      }
      default:
        break
    }

    this.state.updatedAt = nowIso()
    this.emit()
  }

  private move(direction: -1 | 1) {
    if (this.songs.length === 0) {
      return
    }

    if (this.state.isShuffleEnabled && this.state.queueSongIds.length > 0) {
      const currentQueueIndex = this.state.activeSongId
        ? this.state.queueSongIds.indexOf(this.state.activeSongId)
        : -1
      const safeQueueIndex = currentQueueIndex >= 0 ? currentQueueIndex : 0
      const nextQueueIndex =
        (safeQueueIndex + direction + this.state.queueSongIds.length) %
        this.state.queueSongIds.length
      const nextSongId = this.state.queueSongIds[nextQueueIndex]
      const nextSongIndex = this.songs.findIndex((song) => song.id === nextSongId)

      if (nextSongIndex >= 0) {
        this.state.activeIndex = nextSongIndex
      }
    } else {
      this.state.activeIndex =
        (this.state.activeIndex + direction + this.songs.length) % this.songs.length
    }

    this.state.activeSongId = this.songs[this.state.activeIndex]?.id ?? null
    this.state.duration = this.songs[this.state.activeIndex]?.duration ?? 0
    this.state.currentTime = 0
    this.state.playbackStatus = 'playing'
  }

  private nextRepeatMode(current: RepeatMode): RepeatMode {
    if (current === 'off') return 'all'
    if (current === 'all') return 'one'
    return 'off'
  }

  private handleEndedPlayback() {
    if (this.songs.length === 0) {
      this.state.playbackStatus = 'ended'
      this.state.currentTime = 0
      return
    }

    if (this.state.repeatMode === 'one') {
      this.state.currentTime = 0
      this.state.playbackStatus = 'playing'
      return
    }

    const isLastInQueue = this.state.isShuffleEnabled
      ? this.state.activeSongId !== null &&
        this.state.queueSongIds.indexOf(this.state.activeSongId) ===
          this.state.queueSongIds.length - 1
      : this.state.activeIndex === this.songs.length - 1

    if (this.state.repeatMode === 'off' && isLastInQueue) {
      this.state.currentTime = this.state.duration
      this.state.playbackStatus = 'ended'
      return
    }

    this.move(1)
  }

  private emit() {
    for (const listener of this.listeners) {
      listener({ ...this.state })
    }
  }
}
