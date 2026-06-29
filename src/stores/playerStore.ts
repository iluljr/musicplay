import { create } from 'zustand'
import { playbackSession } from '@/services/playbackSession'
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
  toggleShuffle: () => void
  cycleRepeatMode: () => void
}

let playerController: PlayerController | null = null

export const bindPlayerController = (controller: PlayerController) => {
  playerController = controller
}

type PlayerState = {
  tracks: Song[]
  activeIndex: number
  queueSongIds: string[]
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

const callController = <T>(callback: (controller: PlayerController) => T) => {
  if (!playerController) {
    return
  }

  return callback(playerController)
}

export const usePlayerStore = create<PlayerState>((set) => ({
  tracks: [],
  activeIndex: 0,
  queueSongIds: [],
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

      playbackSession.forceClaimMaster()
      void callController((controller) => controller.playTrackAtIndex(nextIndex))
      return {
        ...state,
        activeIndex: nextIndex,
        currentTime: 0,
        playbackStatus: 'playing',
      }
    }),
  play: () =>
    set((state) => {
      playbackSession.forceClaimMaster()
      void callController((controller) => controller.play())
      return {
        ...state,
        playbackStatus: 'playing',
      }
    }),
  pause: () =>
    set((state) => {
      callController((controller) => controller.pause())
      return {
        ...state,
        playbackStatus: 'paused',
      }
    }),
  stop: () =>
    set((state) => {
      callController((controller) => controller.stop())
      return {
        ...state,
        playbackStatus: 'stopped',
        currentTime: 0,
      }
    }),
  togglePlay: () =>
    set((state) => {
      if (state.playbackStatus === 'playing' || state.playbackStatus === 'loading') {
        callController((controller) => controller.pause())
        return {
          ...state,
          playbackStatus: 'paused',
        }
      }

      playbackSession.forceClaimMaster()
      void callController((controller) => controller.play())
      return {
        ...state,
        playbackStatus: 'playing',
      }
    }),
  playNext: () => {
    playbackSession.forceClaimMaster()
    callController((controller) => controller.next())
  },
  playPrevious: () => {
    playbackSession.forceClaimMaster()
    callController((controller) => controller.previous())
  },
  toggleShuffle: () => callController((controller) => controller.toggleShuffle()),
  cycleRepeatMode: () => callController((controller) => controller.cycleRepeatMode()),
  seek: (timeInSeconds) =>
    set((state) => {
      callController((controller) => controller.seek(timeInSeconds))
      return {
        ...state,
        currentTime: Math.max(0, Math.min(timeInSeconds, state.duration || timeInSeconds)),
      }
    }),
  setVolume: (volume) =>
    set((state) => {
      callController((controller) => controller.setVolume(volume))
      return {
        ...state,
        volume,
      }
    }),
  setPlaybackRate: (playbackRate) =>
    set((state) => {
      callController((controller) => controller.setPlaybackRate(playbackRate))
      return {
        ...state,
        playbackRate,
      }
    }),
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
