import type { Track } from '@/types/player'

export const mockTracks: Track[] = [
  {
    id: 'aurora',
    title: 'Aurora Pulse',
    artist: 'Lune Avenue',
    album: 'Nocturne Frames',
    duration: 268,
    progress: 104,
    coverGradient: ['#4d82ff', '#08142d'],
  },
  {
    id: 'velvet',
    title: 'Velvet Skyline',
    artist: 'Static Bloom',
    album: 'Afterlight',
    duration: 221,
    progress: 48,
    coverGradient: ['#ff7a59', '#240b36'],
  },
  {
    id: 'halo',
    title: 'Halo Drive',
    artist: 'North Echo',
    album: 'Signal Theory',
    duration: 197,
    progress: 11,
    coverGradient: ['#67e8f9', '#102746'],
  },
]
