import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useLibraryStore } from '@/stores/libraryStore'
import { usePlaylistStore } from '@/stores/playlistStore'
import type { Song } from '@/types/song'

export const usePlaylistCollection = () => {
  const { playlists, activePlaylistId, loading, ...actions } = usePlaylistStore(
    useShallow((state) => ({
      playlists: state.playlists,
      activePlaylistId: state.activePlaylistId,
      loading: state.loading,
      selectPlaylist: state.selectPlaylist,
      createPlaylist: state.createPlaylist,
      renamePlaylist: state.renamePlaylist,
      deletePlaylist: state.deletePlaylist,
      duplicatePlaylist: state.duplicatePlaylist,
      reorderSongs: state.reorderSongs,
    })),
  )
  const songs = useLibraryStore((state) => state.songs)

  const activePlaylist = useMemo(
    () => playlists.find((playlist) => playlist.id === activePlaylistId) ?? null,
    [activePlaylistId, playlists],
  )

  const playlistSongs = useMemo(
    () =>
      activePlaylist
        ? activePlaylist.songs
            .map((songId) => songs.find((song) => song.id === songId))
            .filter((song): song is Song => Boolean(song))
        : [],
    [activePlaylist, songs],
  )

  const totalDuration = useMemo(
    () => playlistSongs.reduce((total, song) => total + song.duration, 0),
    [playlistSongs],
  )

  return {
    playlists,
    activePlaylistId,
    activePlaylist,
    playlistSongs,
    totalDuration,
    loading,
    ...actions,
  }
}
