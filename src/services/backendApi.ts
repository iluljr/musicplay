import type { ImportSongDraft } from '@/types/media'
import type { Playlist } from '@/types/playlist'
import type { AppSettings } from '@/types/settings'
import type { Song } from '@/types/song'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001'

const createUrl = (path: string) => `${API_BASE_URL}${path}`

const resolveAssetUrl = (value: string) => {
  if (!value.startsWith('/')) {
    return value
  }

  return createUrl(value)
}

const normalizeSong = (song: Song): Song => ({
  ...song,
  audio: resolveAssetUrl(song.audio),
  cover: resolveAssetUrl(song.cover),
  backgroundImage: resolveAssetUrl(song.backgroundImage),
  backgroundVideo: resolveAssetUrl(song.backgroundVideo),
})

const fetchJson = async <T>(path: string, init?: RequestInit) => {
  const response = await fetch(createUrl(path), init)

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  return (await response.json()) as T
}

export const backendApi = {
  baseUrl: API_BASE_URL,
  wsUrl:
    import.meta.env.VITE_WS_URL ??
    `${API_BASE_URL.replace(/^http/, 'ws')}/ws/player`,
  normalizeSong,
  getSongs: async () => (await fetchJson<Song[]>('/api/songs')).map(normalizeSong),
  getPlaylists: () => fetchJson<Playlist[]>('/api/playlists'),
  getSettings: () => fetchJson<AppSettings>('/api/settings'),
  resetPlayer: () =>
    fetchJson<{
      activeSongId: string | null
      activeIndex: number
      queueSongIds: string[]
      playbackStatus: string
      currentTime: number
      duration: number
      isShuffleEnabled: boolean
      repeatMode: string
      volume: number
      playbackRate: number
      error: string | null
      updatedAt: string
    }>('/api/player/reset', { method: 'POST' }),
  updateSong: (songId: string, updates: Partial<Pick<Song, 'title' | 'artist' | 'album' | 'genre' | 'year' | 'favorite'>>) =>
    fetchJson<Song[]>(`/api/songs/${songId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }),
  deleteSong: (songId: string) =>
    fetchJson<Song[]>(`/api/songs/${songId}`, { method: 'DELETE' }),
  deleteAllSongs: () => fetchJson<Song[]>('/api/songs', { method: 'DELETE' }),
  duplicateSong: (songId: string) =>
    fetchJson<Song[]>(`/api/songs/${songId}/duplicate`, { method: 'POST' }),
  createPlaylist: (name: string) =>
    fetchJson<Playlist[]>('/api/playlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    }),
  updatePlaylist: (playlistId: string, updates: Partial<Playlist>) =>
    fetchJson<Playlist[]>(`/api/playlists/${playlistId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }),
  deletePlaylist: (playlistId: string) =>
    fetchJson<Playlist[]>(`/api/playlists/${playlistId}`, { method: 'DELETE' }),
  duplicatePlaylist: (playlistId: string) =>
    fetchJson<Playlist[]>(`/api/playlists/${playlistId}/duplicate`, { method: 'POST' }),
  reorderPlaylistSongs: (playlistId: string, fromIndex: number, toIndex: number) =>
    fetchJson<Playlist[]>(`/api/playlists/${playlistId}/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromIndex, toIndex }),
    }),
  importSongs: async (drafts: ImportSongDraft[]) => {
    const formData = new FormData()

    formData.append(
      'drafts',
      JSON.stringify(
        drafts.map((draft) => ({
          id: draft.id,
          title: draft.title,
          artist: draft.artist,
          album: draft.album,
          genre: draft.genre,
          year: draft.year,
          duration: draft.duration,
          themeColor: draft.themeColor,
          files: Object.fromEntries(
            Object.entries(draft.files)
              .filter((entry) => Boolean(entry[1]))
              .map(([kind, fileRef]) => [
                kind,
                fileRef
                  ? {
                      id: fileRef.id,
                      fileName: fileRef.fileName,
                      kind: fileRef.kind,
                    }
                  : null,
              ]),
          ),
        })),
      ),
    )

    for (const draft of drafts) {
      for (const fileRef of Object.values(draft.files)) {
        if (!fileRef) continue
        formData.append(fileRef.id, fileRef.file, fileRef.fileName)
      }
    }

    return (await fetchJson<Song[]>('/api/import', {
      method: 'POST',
      body: formData,
    })).map(normalizeSong)
  },
}
