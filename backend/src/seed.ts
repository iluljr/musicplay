import type { Playlist, Song } from './types.js'

const now = '2026-06-27T10:00:00.000Z'

export const seedSongs: Song[] = [
  {
    id: 'aurora-pulse',
    title: 'Aurora Pulse',
    artist: 'Lune Avenue',
    album: 'Nocturne Frames',
    genre: 'Synthwave',
    year: 2025,
    duration: 268,
    cover: 'gradient://4d82ff/08142d',
    audio: 'demo://tone/196/18',
    lyrics: `[ar:Lune Avenue]
[ti:Aurora Pulse]
[al:Nocturne Frames]

[00:01.50]Neon smoke above the skyline
[00:04.50]Silver echoes on the floor
[00:09.25]Every heartbeat bends the starlight
[00:12.55]Pull me closer than before`,
    backgroundVideo: '',
    backgroundImage: 'gradient://08142d/0f2a5f',
    themeColor: '#4d82ff',
    favorite: true,
    playCount: 124,
    lastPlayed: '2026-06-26T22:14:00.000Z',
    createdAt: now,
    updatedAt: now,
    assets: { audio: null, cover: null, lyrics: null, background: null },
  },
  {
    id: 'velvet-skyline',
    title: 'Velvet Skyline',
    artist: 'Static Bloom',
    album: 'Afterlight',
    genre: 'Electronic',
    year: 2024,
    duration: 221,
    cover: 'gradient://ff7a59/240b36',
    audio: 'demo://tone/246.94/16',
    lyrics: '',
    backgroundVideo: '',
    backgroundImage: 'gradient://240b36/4a0f24',
    themeColor: '#ff7a59',
    favorite: false,
    playCount: 86,
    lastPlayed: '2026-06-24T17:40:00.000Z',
    createdAt: now,
    updatedAt: now,
    assets: { audio: null, cover: null, lyrics: null, background: null },
  },
  {
    id: 'halo-drive',
    title: 'Halo Drive',
    artist: 'North Echo',
    album: 'Signal Theory',
    genre: 'Electropop',
    year: 2026,
    duration: 197,
    cover: 'gradient://67e8f9/102746',
    audio: 'demo://tone/329.63/20',
    lyrics: '',
    backgroundVideo: '',
    backgroundImage: 'gradient://102746/0c1727',
    themeColor: '#67e8f9',
    favorite: true,
    playCount: 230,
    lastPlayed: '2026-06-27T03:25:00.000Z',
    createdAt: now,
    updatedAt: now,
    assets: { audio: null, cover: null, lyrics: null, background: null },
  },
]

export const seedPlaylists: Playlist[] = [
  {
    id: 'playlist-stream-opener',
    name: 'Stream Opener',
    cover: 'gradient://4d82ff/08142d',
    description: 'High-energy openers and scene setters for live intros.',
    songs: ['aurora-pulse', 'velvet-skyline', 'halo-drive'],
    createdAt: now,
    updatedAt: now,
  },
]
