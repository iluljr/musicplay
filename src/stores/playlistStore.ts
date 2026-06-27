import { create } from 'zustand'
import type { Playlist } from '@/types/playlist'

type PlaylistState = {
  playlists: Playlist[]
  loading: boolean
  activePlaylistId: string | null
  setPlaylists: (playlists: Playlist[]) => void
  setLoading: (loading: boolean) => void
  selectPlaylist: (playlistId: string) => void
  createPlaylist: (name: string) => void
  renamePlaylist: (playlistId: string, name: string) => void
  deletePlaylist: (playlistId: string) => void
  duplicatePlaylist: (playlistId: string) => void
  reorderSongs: (playlistId: string, fromIndex: number, toIndex: number) => void
}

const timestamp = () => new Date().toISOString()

export const usePlaylistStore = create<PlaylistState>((set, get) => ({
  playlists: [],
  loading: true,
  activePlaylistId: null,
  setPlaylists: (playlists) =>
    set({
      playlists,
      activePlaylistId: playlists[0]?.id ?? null,
    }),
  setLoading: (loading) => set({ loading }),
  selectPlaylist: (playlistId) => set({ activePlaylistId: playlistId }),
  createPlaylist: (name) =>
    set((state) => {
      const playlist: Playlist = {
        id: `playlist-${crypto.randomUUID()}`,
        name,
        cover: 'gradient://7ca1ff/09131d',
        description: 'New playlist',
        songs: [],
        createdAt: timestamp(),
        updatedAt: timestamp(),
      }

      return {
        playlists: [playlist, ...state.playlists],
        activePlaylistId: playlist.id,
      }
    }),
  renamePlaylist: (playlistId, name) =>
    set((state) => ({
      playlists: state.playlists.map((playlist) =>
        playlist.id === playlistId
          ? { ...playlist, name, updatedAt: timestamp() }
          : playlist,
      ),
    })),
  deletePlaylist: (playlistId) =>
    set((state) => {
      const playlists = state.playlists.filter((playlist) => playlist.id !== playlistId)
      const activePlaylistId =
        state.activePlaylistId === playlistId
          ? playlists[0]?.id ?? null
          : state.activePlaylistId

      return { playlists, activePlaylistId }
    }),
  duplicatePlaylist: (playlistId) =>
    set((state) => {
      const target = state.playlists.find((playlist) => playlist.id === playlistId)

      if (!target) {
        return state
      }

      const copy: Playlist = {
        ...target,
        id: `playlist-${crypto.randomUUID()}`,
        name: `${target.name} Copy`,
        createdAt: timestamp(),
        updatedAt: timestamp(),
      }

      return {
        playlists: [copy, ...state.playlists],
        activePlaylistId: copy.id,
      }
    }),
  reorderSongs: (playlistId, fromIndex, toIndex) =>
    set((state) => ({
      playlists: state.playlists.map((playlist) => {
        if (playlist.id !== playlistId) {
          return playlist
        }

        const songs = [...playlist.songs]
        const [moved] = songs.splice(fromIndex, 1)
        songs.splice(toIndex, 0, moved)

        return {
          ...playlist,
          songs,
          updatedAt: timestamp(),
        }
      }),
    })),
}))
