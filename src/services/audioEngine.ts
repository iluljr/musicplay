import { playerGateway } from '@/services/playerGateway'
import { playbackSession } from '@/services/playbackSession'
import { setPlayerStoreState } from '@/stores/playerStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { usePlayerStore } from '@/stores/playerStore'
import type { Song } from '@/types/song'
import { createToneAudioUrl } from '@/utils/audio'

class AudioEngine {
  private audio = new Audio()
  private enabled = false
  private mounted = false
  private syncing = false
  private telemetryFrame: number | null = null
  private lastTelemetryAt = 0
  private lastSentPlaybackStatus: 'playing' | 'paused' | 'stopped' | 'ended' | null = null
  private forcedPlaybackStatus: 'stopped' | null = null
  private sourceByTrackId = new Map<string, string>()
  private unsubscribe: (() => void) | null = null

  constructor() {
    this.audio.preload = 'auto'
    this.audio.addEventListener('play', () => this.flushTelemetry(true, 'playing'))
    this.audio.addEventListener('pause', () => {
      const nextStatus = this.forcedPlaybackStatus ?? 'paused'
      this.forcedPlaybackStatus = null
      this.flushTelemetry(true, nextStatus)
    })
    this.audio.addEventListener('ended', () => this.flushTelemetry(true, 'ended'))
    this.audio.addEventListener('timeupdate', () => this.queueTelemetry())
    playbackSession.subscribeToReset(() => {
      this.syncing = true
      this.forcedPlaybackStatus = 'stopped'
      this.audio.pause()
      this.audio.currentTime = 0
      this.syncing = false
      setPlayerStoreState({
        playbackStatus: 'stopped',
        currentTime: 0,
        isShuffleEnabled: false,
        repeatMode: 'all',
        volume: 72,
        playbackRate: 1,
        error: null,
      })
    })
  }

  mount = (enabled: boolean) => {
    this.enabled = enabled

    if (!this.mounted) {
      this.mounted = true
      this.unsubscribe = usePlayerStore.subscribe((state) => {
        void this.reconcile(state)
      })
    }

    if (!enabled) {
      this.syncing = true
      this.audio.pause()
      this.syncing = false
      return
    }

    void this.reconcile(usePlayerStore.getState())
  }

  private async reconcile(state: ReturnType<typeof usePlayerStore.getState>) {
    if (!this.enabled || state.tracks.length === 0) {
      return
    }

    const autoPlayEnabled = useSettingsStore.getState().settings?.autoPlay ?? true

    const track = state.tracks[state.activeIndex]
    if (!track) {
      return
    }

    this.ensureTrackSource(track)
    const source = this.sourceByTrackId.get(track.id)
    if (!source) {
      return
    }

    if (this.audio.src !== source) {
      this.syncing = true
      this.audio.src = source
      if (state.currentTime > 0) {
        this.audio.addEventListener(
          'loadedmetadata',
          () => {
            this.syncing = true
            this.audio.currentTime = state.currentTime
            this.syncing = false
          },
          { once: true },
        )
      }
      this.syncing = false
    }

    if (Math.abs(this.audio.volume * 100 - state.volume) > 1) {
      this.audio.volume = state.volume / 100
    }

    if (Math.abs(this.audio.playbackRate - state.playbackRate) > 0.01) {
      this.audio.playbackRate = state.playbackRate
    }

    const canResyncWhilePlaying =
      state.playbackStatus !== 'playing' || Math.abs(this.audio.currentTime - state.currentTime) > 2.5

    if (canResyncWhilePlaying && Math.abs(this.audio.currentTime - state.currentTime) > 0.75) {
      this.syncing = true
      this.audio.currentTime = state.currentTime
      this.syncing = false
    }

    const shouldPlay = state.playbackStatus === 'playing' || state.playbackStatus === 'loading'
    const shouldPause = ['paused', 'stopped', 'ended', 'idle', 'error'].includes(state.playbackStatus)
    const canOwnPlayback =
      playbackSession.isMaster() ||
      (!playbackSession.hasActiveMaster() && autoPlayEnabled && playbackSession.claimMaster())

    if (!canOwnPlayback && !this.audio.paused) {
      this.syncing = true
      this.audio.pause()
      this.syncing = false
    }

    if (shouldPlay && this.audio.paused && canOwnPlayback) {
      try {
        await this.audio.play()
        this.flushTelemetry(true, 'playing')
      } catch {
        // Autoplay can fail on browser policy; controller UI remains functional.
      }
    }

    if (shouldPause && !this.audio.paused) {
      if (state.playbackStatus === 'stopped') {
        this.forcedPlaybackStatus = 'stopped'
      }
      this.audio.pause()
    }

    if (state.playbackStatus === 'stopped') {
      this.forcedPlaybackStatus = 'stopped'
    }

    if (state.playbackStatus === 'stopped' && this.audio.currentTime !== 0) {
      this.syncing = true
      this.audio.currentTime = 0
      this.syncing = false
    }

    if (state.playbackStatus === 'stopped') {
      this.flushTelemetry(true, 'stopped')
    }
  }

  private ensureTrackSource(track: Song) {
    if (this.sourceByTrackId.has(track.id)) {
      return
    }

    if (track.audio.startsWith('demo://tone/')) {
      const payload = track.audio.replace('demo://tone/', '')
      const [frequency, duration] = payload.split('/').map(Number)
      this.sourceByTrackId.set(track.id, createToneAudioUrl(frequency, duration))
      return
    }

    this.sourceByTrackId.set(track.id, track.audio)
  }

  private queueTelemetry() {
    if (this.telemetryFrame !== null || this.audio.paused || this.audio.ended) {
      return
    }

    this.telemetryFrame = window.requestAnimationFrame(() => {
      this.telemetryFrame = null
      this.flushTelemetry(false, 'playing')
    })
  }

  private flushTelemetry(force: boolean, playbackStatus: 'playing' | 'paused' | 'stopped' | 'ended') {
    if (!this.enabled || this.syncing) {
      return
    }

    const now = performance.now()
    if (
      !force &&
      now - this.lastTelemetryAt < 200 &&
      this.lastSentPlaybackStatus === playbackStatus
    ) {
      return
    }

    this.lastTelemetryAt = now
    this.lastSentPlaybackStatus = playbackStatus
    playerGateway.sendTelemetry({
      currentTime: this.audio.currentTime,
      duration: Number.isFinite(this.audio.duration) ? this.audio.duration : 0,
      playbackStatus,
    })
  }
}

export const audioEngine = new AudioEngine()
