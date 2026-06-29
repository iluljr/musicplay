import { create } from 'zustand'
import { backendApi } from '@/services/backendApi'
import type { Playlist } from '@/types/playlist'

type PlaylistState = {
  playlists: Playlist[]
  loading: boolean
  activePlaylistId: string | null
  setPlaylists: (playlists: Playlist[]) => void
  setLoading: (loading: boolean) => void
  selectPlaylist: (playlistId: string) => void
  createPlaylist: (name: string) => Promise<void>
  renamePlaylist: (playlistId: string, name: string) => Promise<void>
  deletePlaylist: (playlistId: string) => Promise<void>
  duplicatePlaylist: (playlistId: string) => Promise<void>
  reorderSongs: (playlistId: string, fromIndex: number, toIndex: number) => Promise<void>
}

export const usePlaylistStore = create<PlaylistState>((set) => ({
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
  createPlaylist: async (name) => {
    const playlists = await backendApi.createPlaylist(name)
    set({
      playlists,
      activePlaylistId: playlists[0]?.id ?? null,
    })
  },
  renamePlaylist: async (playlistId, name) => {
    const playlists = await backendApi.updatePlaylist(playlistId, { name })
    set((state) => ({
      playlists,
      activePlaylistId: state.activePlaylistId ?? playlists[0]?.id ?? null,
    }))
  },
  deletePlaylist: async (playlistId) => {
    const playlists = await backendApi.deletePlaylist(playlistId)
    set((state) => ({
      playlists,
      activePlaylistId:
        state.activePlaylistId === playlistId
          ? playlists[0]?.id ?? null
          : state.activePlaylistId,
    }))
  },
  duplicatePlaylist: async (playlistId) => {
    const playlists = await backendApi.duplicatePlaylist(playlistId)
    set({
      playlists,
      activePlaylistId: playlists[0]?.id ?? null,
    })
  },
  reorderSongs: async (playlistId, fromIndex, toIndex) => {
    const playlists = await backendApi.reorderPlaylistSongs(playlistId, fromIndex, toIndex)
    set((state) => ({
      playlists,
      activePlaylistId: state.activePlaylistId ?? playlists[0]?.id ?? null,
    }))
  },
}))
