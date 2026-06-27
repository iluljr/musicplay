import { create } from 'zustand'
import { mockTracks } from '@/assets/mock/tracks'
import type { RepeatMode } from '@/types/player'

type PlayerState = {
  tracks: typeof mockTracks
  activeIndex: number
  isPlaying: boolean
  isShuffleEnabled: boolean
  repeatMode: RepeatMode
  volume: number
  setVolume: (volume: number) => void
  togglePlay: () => void
  playNext: () => void
  playPrevious: () => void
  toggleShuffle: () => void
  cycleRepeatMode: () => void
}

const repeatOrder: RepeatMode[] = ['off', 'all', 'one']

export const usePlayerStore = create<PlayerState>((set) => ({
  tracks: mockTracks,
  activeIndex: 0,
  isPlaying: true,
  isShuffleEnabled: false,
  repeatMode: 'all',
  volume: 72,
  setVolume: (volume) => set({ volume }),
  togglePlay: () =>
    set((state) => ({
      isPlaying: !state.isPlaying,
    })),
  playNext: () =>
    set((state) => ({
      activeIndex: (state.activeIndex + 1) % state.tracks.length,
    })),
  playPrevious: () =>
    set((state) => ({
      activeIndex:
        (state.activeIndex - 1 + state.tracks.length) % state.tracks.length,
    })),
  toggleShuffle: () =>
    set((state) => ({
      isShuffleEnabled: !state.isShuffleEnabled,
    })),
  cycleRepeatMode: () =>
    set((state) => ({
      repeatMode:
        repeatOrder[(repeatOrder.indexOf(state.repeatMode) + 1) % repeatOrder.length],
    })),
}))
