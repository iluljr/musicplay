import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { playerGateway } from '@/services/playerGateway'
import { useLibraryStore } from '@/stores/libraryStore'
import { usePlayerStore } from '@/stores/playerStore'
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
      setPlaylistSongs: state.setPlaylistSongs,
    })),
  )
  const songs = useLibraryStore((state) => state.songs)
  const playerState = usePlayerStore(
    useShallow((state) => ({
      activeSongId: state.tracks[state.activeIndex]?.id ?? null,
      queueSongIds: state.queueSongIds,
      playbackStatus: state.playbackStatus,
    })),
  )

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

  const availableSongs = useMemo(
    () =>
      activePlaylist
        ? songs.filter((song) => !activePlaylist.songs.includes(song.id))
        : songs,
    [activePlaylist, songs],
  )

  const isQueueActive = useMemo(() => {
    if (!activePlaylist || activePlaylist.songs.length === 0) {
      return false
    }

    return (
      activePlaylist.songs.length === playerState.queueSongIds.length &&
      activePlaylist.songs.every((songId) => playerState.queueSongIds.includes(songId))
    )
  }, [activePlaylist, playerState.queueSongIds])

  const addSongToPlaylist = async (playlistId: string, songId: string) => {
    const playlist = playlists.find((entry) => entry.id === playlistId)
    if (!playlist || playlist.songs.includes(songId)) {
      return
    }

    await actions.setPlaylistSongs(playlistId, [...playlist.songs, songId])
  }

  const removeSongFromPlaylist = async (playlistId: string, songId: string) => {
    const playlist = playlists.find((entry) => entry.id === playlistId)
    if (!playlist) {
      return
    }

    await actions.setPlaylistSongs(
      playlistId,
      playlist.songs.filter((entry) => entry !== songId),
    )
  }

  const activatePlaylistQueue = (playlistId: string, startSongId?: string, shouldPlay = false) => {
    const playlist = playlists.find((entry) => entry.id === playlistId)
    if (!playlist || playlist.songs.length === 0) {
      return
    }

    playerGateway.setQueue(playlist.songs, startSongId ?? playlist.songs[0], shouldPlay)
  }

  return {
    playlists,
    activePlaylistId,
    activePlaylist,
    playlistSongs,
    availableSongs,
    totalDuration,
    isQueueActive,
    activeSongId: playerState.activeSongId,
    playbackStatus: playerState.playbackStatus,
    loading,
    addSongToPlaylist,
    removeSongFromPlaylist,
    activatePlaylistQueue,
    ...actions,
  }
}
