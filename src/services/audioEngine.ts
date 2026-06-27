import {
  bindPlayerController,
  setPlayerStoreState,
  usePlayerStore,
  type PlayerController,
} from '@/stores/playerStore'
import type { Song } from '@/types/song'
import { createToneAudioUrl } from '@/utils/audio'

type LoadTrackOptions = {
  autoplay?: boolean
  preserveTime?: boolean
}

class AudioEngine implements PlayerController {
  private audio = new Audio()
  private frameId: number | null = null
  private isMounted = false
  private sourceByTrackId = new Map<string, string>()

  constructor() {
    this.audio.preload = 'auto'
    this.audio.addEventListener('loadedmetadata', this.handleLoadedMetadata)
    this.audio.addEventListener('play', this.handlePlay)
    this.audio.addEventListener('pause', this.handlePause)
    this.audio.addEventListener('ended', this.handleEnded)
    this.audio.addEventListener('volumechange', this.handleVolumeChange)
    this.audio.addEventListener('ratechange', this.handleRateChange)
    this.audio.addEventListener('seeking', this.handleSeeking)
    this.audio.addEventListener('seeked', this.handleSeeked)
    this.audio.addEventListener('waiting', this.handleWaiting)
    this.audio.addEventListener('canplay', this.handleCanPlay)
    this.audio.addEventListener('error', this.handleError)
    this.audio.addEventListener('timeupdate', this.syncCurrentTime)
    document.addEventListener('visibilitychange', this.handleVisibilityChange)
  }

  mount = () => {
    if (this.isMounted) {
      return
    }

    this.isMounted = true
    bindPlayerController(this)

    const state = usePlayerStore.getState()
    this.ensureTrackSources()
    this.audio.volume = state.volume / 100
    this.audio.playbackRate = state.playbackRate
    this.loadTrack(state.activeIndex, { autoplay: false, preserveTime: false })
  }

  play = async () => {
    const state = usePlayerStore.getState()

    if (!this.audio.src) {
      this.loadTrack(state.activeIndex, { autoplay: true, preserveTime: true })
      return
    }

    try {
      await this.audio.play()
    } catch {
      setPlayerStoreState({
        playbackStatus: 'error',
        error: 'Playback could not be started.',
      })
    }
  }

  pause = () => {
    this.audio.pause()
  }

  stop = () => {
    this.audio.pause()
    this.audio.currentTime = 0
    this.syncCurrentTime()
    setPlayerStoreState({
      playbackStatus: 'stopped',
      currentTime: 0,
    })
  }

  previous = () => {
    const state = usePlayerStore.getState()
    const shouldAutoplay =
      state.playbackStatus === 'playing' || state.playbackStatus === 'loading'

    if (this.audio.currentTime > 2.5) {
      this.seek(0)
      return
    }

    const previousIndex = this.getAdjacentIndex(-1, state)
    this.loadTrack(previousIndex, { autoplay: shouldAutoplay })
  }

  next = () => {
    const state = usePlayerStore.getState()
    const shouldAutoplay =
      state.playbackStatus === 'playing' || state.playbackStatus === 'loading'
    const nextIndex = this.getAdjacentIndex(1, state)
    this.loadTrack(nextIndex, { autoplay: shouldAutoplay })
  }

  playTrackAtIndex = (index: number) => {
    this.loadTrack(index, { autoplay: true })
  }

  seek = (timeInSeconds: number) => {
    const duration = this.audio.duration || usePlayerStore.getState().duration
    const clampedTime = Math.max(0, Math.min(timeInSeconds, duration || 0))

    this.audio.currentTime = clampedTime
    this.syncCurrentTime()
    setPlayerStoreState({ currentTime: clampedTime })
  }

  setVolume = (volume: number) => {
    const normalizedVolume = Math.max(0, Math.min(volume, 100))
    this.audio.volume = normalizedVolume / 100
    setPlayerStoreState({ volume: normalizedVolume })
  }

  setPlaybackRate = (playbackRate: number) => {
    const normalizedRate = Math.max(0.5, Math.min(playbackRate, 2))
    this.audio.playbackRate = normalizedRate
    setPlayerStoreState({ playbackRate: normalizedRate })
  }

  loadTrack = (index: number, options: LoadTrackOptions = {}) => {
    const { autoplay = false, preserveTime = false } = options
    const state = usePlayerStore.getState()
    const track = state.tracks[index]

    if (!track) {
      return
    }

    this.ensureTrackSource(track)
    const source = this.sourceByTrackId.get(track.id)

    if (!source) {
      return
    }

    const shouldKeepCurrentTime = preserveTime && state.activeIndex === index
    const nextTime = shouldKeepCurrentTime ? state.currentTime : 0

    setPlayerStoreState({
      activeIndex: index,
      currentTime: nextTime,
      duration: 0,
      isReady: false,
      playbackStatus: autoplay ? 'loading' : 'paused',
      error: null,
    })

    this.cancelAnimationFrame()
    this.audio.src = source
    this.audio.load()
    this.audio.currentTime = nextTime

    if (autoplay) {
      void this.play()
    }
  }

  private ensureTrackSources() {
    for (const track of usePlayerStore.getState().tracks) {
      this.ensureTrackSource(track)
    }
  }

  private ensureTrackSource(track: Song) {
    if (this.sourceByTrackId.has(track.id)) {
      return
    }

    if (track.audio.startsWith('demo://tone/')) {
      const payload = track.audio.replace('demo://tone/', '')
      const [frequency, duration] = payload.split('/').map(Number)

      this.sourceByTrackId.set(
        track.id,
        createToneAudioUrl(frequency, duration),
      )
      return
    }

    this.sourceByTrackId.set(track.id, track.audio)
  }

  private getAdjacentIndex(direction: -1 | 1, state: ReturnType<typeof usePlayerStore.getState>) {
    const { activeIndex, isShuffleEnabled, tracks } = state

    if (isShuffleEnabled && tracks.length > 1) {
      const availableIndexes = tracks
        .map((_, index) => index)
        .filter((index) => index !== activeIndex)

      return availableIndexes[Math.floor(Math.random() * availableIndexes.length)]
    }

    return (activeIndex + direction + tracks.length) % tracks.length
  }

  private handleLoadedMetadata = () => {
    setPlayerStoreState({
      duration: Number.isFinite(this.audio.duration) ? this.audio.duration : 0,
      currentTime: this.audio.currentTime,
      isReady: true,
    })
  }

  private handlePlay = () => {
    setPlayerStoreState({
      playbackStatus: 'playing',
      error: null,
    })
    this.startAnimationFrame()
  }

  private handlePause = () => {
    const { playbackStatus } = usePlayerStore.getState()

    if (playbackStatus !== 'stopped' && playbackStatus !== 'ended') {
      setPlayerStoreState({ playbackStatus: 'paused' })
    }

    this.cancelAnimationFrame()
    this.syncCurrentTime()
  }

  private handleEnded = () => {
    const state = usePlayerStore.getState()

    if (state.repeatMode === 'one') {
      this.seek(0)
      void this.play()
      return
    }

    const isLastTrack = !state.isShuffleEnabled && state.activeIndex === state.tracks.length - 1

    if (state.repeatMode === 'off' && isLastTrack) {
      setPlayerStoreState({
        playbackStatus: 'ended',
        currentTime: this.audio.duration || state.duration,
      })
      return
    }

    const nextIndex = this.getAdjacentIndex(1, state)
    this.loadTrack(nextIndex, { autoplay: true })
  }

  private handleVolumeChange = () => {
    setPlayerStoreState({
      volume: Math.round(this.audio.volume * 100),
    })
  }

  private handleRateChange = () => {
    setPlayerStoreState({
      playbackRate: this.audio.playbackRate,
    })
  }

  private handleSeeking = () => {
    setPlayerStoreState({
      currentTime: this.audio.currentTime,
    })
  }

  private handleSeeked = () => {
    this.syncCurrentTime()
  }

  private handleWaiting = () => {
    const { playbackStatus } = usePlayerStore.getState()

    if (playbackStatus === 'playing') {
      setPlayerStoreState({ playbackStatus: 'loading' })
    }
  }

  private handleCanPlay = () => {
    const { playbackStatus } = usePlayerStore.getState()

    if (playbackStatus === 'loading' && !this.audio.paused) {
      setPlayerStoreState({ playbackStatus: 'playing' })
    }
  }

  private handleError = () => {
    this.cancelAnimationFrame()
    setPlayerStoreState({
      playbackStatus: 'error',
      error: 'Audio source failed to load.',
    })
  }

  private handleVisibilityChange = () => {
    if (document.hidden) {
      this.cancelAnimationFrame()
      return
    }

    if (!this.audio.paused) {
      this.startAnimationFrame()
    } else {
      this.syncCurrentTime()
    }
  }

  private syncCurrentTime = () => {
    setPlayerStoreState({
      currentTime: this.audio.currentTime,
      duration: Number.isFinite(this.audio.duration) ? this.audio.duration : 0,
    })
  }

  private startAnimationFrame() {
    this.cancelAnimationFrame()

    const tick = () => {
      if (document.hidden || this.audio.paused) {
        this.frameId = null
        return
      }

      this.syncCurrentTime()
      this.frameId = window.requestAnimationFrame(tick)
    }

    this.frameId = window.requestAnimationFrame(tick)
  }

  private cancelAnimationFrame() {
    if (this.frameId !== null) {
      window.cancelAnimationFrame(this.frameId)
      this.frameId = null
    }
  }
}

export const audioEngine = new AudioEngine()
