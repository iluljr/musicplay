import type { PlayerCommandMessage, PlayerState, RepeatMode, Song } from './types.js'

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
  private baseQueueSongIds: string[] = []
  private hasCustomQueue = false
  private listeners = new Set<Broadcast>()

  private createSequentialQueueSongIds() {
    return this.songs.map((song) => song.id)
  }

  private createShuffleQueueSongIds(queueSongIds: string[], currentSongId: string | null) {
    const songIds = [...queueSongIds]

    if (songIds.length <= 1) {
      return songIds
    }

    const fallbackSongId =
      currentSongId && songIds.includes(currentSongId) ? currentSongId : songIds[0]
    const remainingSongIds = shuffleArray(
      songIds.filter((songId) => songId !== fallbackSongId),
    )

    return [fallbackSongId, ...remainingSongIds]
  }

  private getResolvedBaseQueueSongIds() {
    return this.baseQueueSongIds.length > 0
      ? this.baseQueueSongIds
      : this.createSequentialQueueSongIds()
  }

  private getEffectiveQueueSongIds() {
    return this.state.queueSongIds.length > 0
      ? this.state.queueSongIds
      : this.createSequentialQueueSongIds()
  }

  private syncVisibleQueueSongIds(currentSongId: string | null) {
    const baseQueueSongIds = this.getResolvedBaseQueueSongIds()
    this.state.queueSongIds = this.state.isShuffleEnabled
      ? this.createShuffleQueueSongIds(baseQueueSongIds, currentSongId)
      : baseQueueSongIds
  }

  private applyActiveSong(nextSongId: string | null, shouldPlay = false) {
    if (!nextSongId) {
      this.state.activeSongId = null
      this.state.activeIndex = 0
      this.state.currentTime = 0
      this.state.duration = 0
      if (shouldPlay) {
        this.state.playbackStatus = 'idle'
      }
      return
    }

    const nextSongIndex = this.songs.findIndex((song) => song.id === nextSongId)
    if (nextSongIndex < 0) {
      return
    }

    this.state.activeSongId = nextSongId
    this.state.activeIndex = nextSongIndex
    this.state.currentTime = 0
    this.state.duration = this.songs[nextSongIndex]?.duration ?? 0
    if (shouldPlay) {
      this.state.playbackStatus = 'playing'
    }
  }

  setSongs(songs: Song[]) {
    const previousSongIds = this.songs.map((song) => song.id)
    const previousSongId = this.state.activeSongId

    this.songs = songs

    if (!this.hasCustomQueue) {
      const hadFullLibraryQueue =
        this.baseQueueSongIds.length === 0 ||
        (this.baseQueueSongIds.length === previousSongIds.length &&
          this.baseQueueSongIds.every((songId) => previousSongIds.includes(songId)))

      this.baseQueueSongIds = hadFullLibraryQueue
        ? this.createSequentialQueueSongIds()
        : this.baseQueueSongIds.filter((songId) => this.songs.some((song) => song.id === songId))
    } else {
      this.baseQueueSongIds = this.baseQueueSongIds.filter((songId) =>
        this.songs.some((song) => song.id === songId),
      )

      if (this.baseQueueSongIds.length === 0) {
        this.hasCustomQueue = false
        this.baseQueueSongIds = this.createSequentialQueueSongIds()
      }
    }

    this.syncVisibleQueueSongIds(previousSongId)

    const nextSongId =
      previousSongId && this.songs.some((song) => song.id === previousSongId)
        ? previousSongId
        : this.state.queueSongIds[0] ?? null

    this.applyActiveSong(nextSongId)
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
    this.hasCustomQueue = false
    this.baseQueueSongIds = this.createSequentialQueueSongIds()
    this.state = {
      activeSongId: this.songs[0]?.id ?? null,
      activeIndex: 0,
      queueSongIds: this.baseQueueSongIds,
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
        this.syncVisibleQueueSongIds(this.state.activeSongId)
        break
      case 'repeat':
        this.state.repeatMode = this.nextRepeatMode(this.state.repeatMode)
        break
      case 'playSongId': {
        const nextIndex = this.songs.findIndex((song) => song.id === message.songId)
        if (nextIndex >= 0) {
          this.applyActiveSong(this.songs[nextIndex].id, true)
        }
        break
      }
      case 'setQueue': {
        const nextBaseQueueSongIds = message.songIds.filter((songId, index) => {
          return (
            this.songs.some((song) => song.id === songId) &&
            message.songIds.indexOf(songId) === index
          )
        })

        this.hasCustomQueue = true
        this.baseQueueSongIds =
          nextBaseQueueSongIds.length > 0 ? nextBaseQueueSongIds : this.createSequentialQueueSongIds()
        this.syncVisibleQueueSongIds(message.startSongId ?? this.state.activeSongId)

        const nextSongId =
          message.startSongId && this.state.queueSongIds.includes(message.startSongId)
            ? message.startSongId
            : this.state.queueSongIds[0] ?? null

        this.applyActiveSong(nextSongId, message.shouldPlay ?? false)
        break
      }
      default:
        break
    }

    this.state.updatedAt = nowIso()
    this.emit()
  }

  private move(direction: -1 | 1) {
    const effectiveQueueSongIds = this.getEffectiveQueueSongIds()

    if (this.songs.length === 0 || effectiveQueueSongIds.length === 0) {
      return
    }

    const currentQueueIndex = this.state.activeSongId
      ? effectiveQueueSongIds.indexOf(this.state.activeSongId)
      : -1
    const safeQueueIndex = currentQueueIndex >= 0 ? currentQueueIndex : 0
    const nextQueueIndex =
      (safeQueueIndex + direction + effectiveQueueSongIds.length) % effectiveQueueSongIds.length

    this.applyActiveSong(effectiveQueueSongIds[nextQueueIndex] ?? null, true)
  }

  private nextRepeatMode(current: RepeatMode): RepeatMode {
    if (current === 'off') return 'all'
    if (current === 'all') return 'one'
    return 'off'
  }

  private handleEndedPlayback() {
    const effectiveQueueSongIds = this.getEffectiveQueueSongIds()

    if (this.songs.length === 0 || effectiveQueueSongIds.length === 0) {
      this.state.playbackStatus = 'ended'
      this.state.currentTime = 0
      return
    }

    if (this.state.repeatMode === 'one') {
      this.state.currentTime = 0
      this.state.playbackStatus = 'playing'
      return
    }

    const isLastInQueue =
      this.state.activeSongId !== null &&
      effectiveQueueSongIds.indexOf(this.state.activeSongId) === effectiveQueueSongIds.length - 1

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
