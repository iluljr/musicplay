import { create } from 'zustand'
import type { PlaybackStatus, RepeatMode } from '@/types/player'
import type { Song } from '@/types/song'

export type PlayerController = {
  play: () => Promise<void> | void
  pause: () => void
  stop: () => void
  previous: () => void
  next: () => void
  playTrackAtIndex: (index: number) => void
  seek: (timeInSeconds: number) => void
  setVolume: (volume: number) => void
  setPlaybackRate: (playbackRate: number) => void
}

let playerController: PlayerController | null = null

export const bindPlayerController = (controller: PlayerController) => {
  playerController = controller
}

type PlayerState = {
  tracks: Song[]
  activeIndex: number
  playbackStatus: PlaybackStatus
  currentTime: number
  duration: number
  isShuffleEnabled: boolean
  isReady: boolean
  repeatMode: RepeatMode
  volume: number
  playbackRate: number
  error: string | null
  setTracks: (tracks: Song[]) => void
  playSongById: (songId: string) => void
  play: () => void
  pause: () => void
  stop: () => void
  togglePlay: () => void
  playNext: () => void
  playPrevious: () => void
  toggleShuffle: () => void
  cycleRepeatMode: () => void
  seek: (timeInSeconds: number) => void
  setVolume: (volume: number) => void
  setPlaybackRate: (playbackRate: number) => void
}

const repeatOrder: RepeatMode[] = ['off', 'all', 'one']

const callController = <T>(callback: (controller: PlayerController) => T) => {
  if (!playerController) {
    return
  }

  return callback(playerController)
}

export const usePlayerStore = create<PlayerState>((set) => ({
  tracks: [],
  activeIndex: 0,
  playbackStatus: 'idle',
  currentTime: 0,
  duration: 0,
  isShuffleEnabled: false,
  isReady: false,
  repeatMode: 'all',
  volume: 72,
  playbackRate: 1,
  error: null,
  setTracks: (tracks) =>
    set((state) => ({
      tracks,
      activeIndex:
        tracks.length === 0
          ? 0
          : Math.min(state.activeIndex, tracks.length - 1),
    })),
  playSongById: (songId) =>
    set((state) => {
      const nextIndex = state.tracks.findIndex((track) => track.id === songId)

      if (nextIndex === -1) {
        return state
      }

      void callController((controller) => controller.playTrackAtIndex(nextIndex))
      return state
    }),
  play: () => {
    void callController((controller) => controller.play())
  },
  pause: () => callController((controller) => controller.pause()),
  stop: () => callController((controller) => controller.stop()),
  togglePlay: () =>
    set((state) => {
      if (state.playbackStatus === 'playing' || state.playbackStatus === 'loading') {
        callController((controller) => controller.pause())
        return state
      }

      void callController((controller) => controller.play())
      return state
    }),
  playNext: () => callController((controller) => controller.next()),
  playPrevious: () => callController((controller) => controller.previous()),
  toggleShuffle: () =>
    set((state) => ({
      isShuffleEnabled: !state.isShuffleEnabled,
    })),
  cycleRepeatMode: () =>
    set((state) => ({
      repeatMode:
        repeatOrder[(repeatOrder.indexOf(state.repeatMode) + 1) % repeatOrder.length],
    })),
  seek: (timeInSeconds) =>
    callController((controller) => controller.seek(timeInSeconds)),
  setVolume: (volume) => callController((controller) => controller.setVolume(volume)),
  setPlaybackRate: (playbackRate) =>
    callController((controller) => controller.setPlaybackRate(playbackRate)),
}))

export const setPlayerStoreState = (
  state: Partial<Omit<PlayerState, keyof Pick<
    PlayerState,
    | 'setTracks'
    | 'playSongById'
    | 'play'
    | 'pause'
    | 'stop'
    | 'togglePlay'
    | 'playNext'
    | 'playPrevious'
    | 'toggleShuffle'
    | 'cycleRepeatMode'
    | 'seek'
    | 'setVolume'
    | 'setPlaybackRate'
  >>>,
) => {
  usePlayerStore.setState(state)
}
