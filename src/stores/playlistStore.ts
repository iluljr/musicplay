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
  setPlaylistSongs: (playlistId: string, songIds: string[]) => Promise<void>
  createPlaylistWithSongs: (name: string, songIds: string[]) => Promise<void>
}

export const usePlaylistStore = create<PlaylistState>((set) => ({
  playlists: [],
  loading: true,
  activePlaylistId: null,
  setPlaylists: (playlists) =>
    set((state) => ({
      playlists,
      activePlaylistId:
        playlists.find((playlist) => playlist.id === state.activePlaylistId)?.id ??
        state.activePlaylistId ??
        playlists[0]?.id ??
        null,
    })),
  setLoading: (loading) => set({ loading }),
  selectPlaylist: (playlistId) => set({ activePlaylistId: playlistId }),
  createPlaylist: async (name) => {
    const previousPlaylistIds = usePlaylistStore.getState().playlists.map((playlist) => playlist.id)
    const playlists = await backendApi.createPlaylist(name)
    const createdPlaylist = playlists.find((playlist) => !previousPlaylistIds.includes(playlist.id))
    set({
      playlists,
      activePlaylistId: createdPlaylist?.id ?? playlists[0]?.id ?? null,
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
    const previousPlaylistIds = usePlaylistStore.getState().playlists.map((playlist) => playlist.id)
    const playlists = await backendApi.duplicatePlaylist(playlistId)
    const createdPlaylist = playlists.find((playlist) => !previousPlaylistIds.includes(playlist.id))
    set({
      playlists,
      activePlaylistId: createdPlaylist?.id ?? playlists[0]?.id ?? null,
    })
  },
  reorderSongs: async (playlistId, fromIndex, toIndex) => {
    const playlists = await backendApi.reorderPlaylistSongs(playlistId, fromIndex, toIndex)
    set((state) => ({
      playlists,
      activePlaylistId: state.activePlaylistId ?? playlists[0]?.id ?? null,
    }))
  },
  setPlaylistSongs: async (playlistId, songIds) => {
    const playlists = await backendApi.updatePlaylist(playlistId, { songs: songIds })
    set((state) => ({
      playlists,
      activePlaylistId: state.activePlaylistId ?? playlists[0]?.id ?? null,
    }))
  },
  createPlaylistWithSongs: async (name, songIds) => {
    const previousPlaylistIds = usePlaylistStore.getState().playlists.map((playlist) => playlist.id)
    const createdPlaylists = await backendApi.createPlaylist(name)
    const createdPlaylist = createdPlaylists.find(
      (playlist) => !previousPlaylistIds.includes(playlist.id),
    )

    if (!createdPlaylist) {
      set({
        playlists: createdPlaylists,
        activePlaylistId: createdPlaylists[0]?.id ?? null,
      })
      return
    }

    const playlists = await backendApi.updatePlaylist(createdPlaylist.id, { songs: songIds })
    set({
      playlists,
      activePlaylistId: createdPlaylist.id,
    })
  },
}))
