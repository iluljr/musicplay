import type { Playlist } from '@/types/playlist'

const now = '2026-06-27T10:00:00.000Z'

export const mockPlaylists: Playlist[] = [
  {
    id: 'playlist-stream-opener',
    name: 'Stream Opener',
    cover: 'gradient://4d82ff/08142d',
    description: 'High-energy openers and scene setters for live intros.',
    songs: ['aurora-pulse', 'velvet-skyline', 'halo-drive'],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'playlist-night-shift',
    name: 'Night Shift',
    cover: 'gradient://67e8f9/102746',
    description: 'Cooler, longer songs for late-night segments.',
    songs: ['midnight-frames', 'cyan-embers', 'soft-static'],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'playlist-chatting-scene',
    name: 'Chatting Scene',
    cover: 'gradient://f9a8d4/3b1247',
    description: 'Softer colors for intermission and just-chatting blocks.',
    songs: ['lumen-fall', 'mirage-code', 'velvet-skyline'],
    createdAt: now,
    updatedAt: now,
  },
]
