import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useLibraryStore } from '@/stores/libraryStore'
import type { Song } from '@/types/song'

const hasAsset = (song: Song, kind: keyof Song['assets']) => Boolean(song.assets[kind])

export const useLibraryCollection = () => {
  const state = useLibraryStore(
    useShallow((library) => ({
      songs: library.songs,
      loading: library.loading,
      search: library.search,
      genreFilter: library.genreFilter,
      lyricsFilter: library.lyricsFilter,
      assetFilter: library.assetFilter,
      sortBy: library.sortBy,
      sortOrder: library.sortOrder,
      currentPage: library.currentPage,
      pageSize: library.pageSize,
      viewMode: library.viewMode,
      selectedSongIds: library.selectedSongIds,
      setSearch: library.setSearch,
      setGenreFilter: library.setGenreFilter,
      setLyricsFilter: library.setLyricsFilter,
      setAssetFilter: library.setAssetFilter,
      setSortBy: library.setSortBy,
      setCurrentPage: library.setCurrentPage,
      setPageSize: library.setPageSize,
      setViewMode: library.setViewMode,
      toggleSelectedSong: library.toggleSelectedSong,
      selectSongs: library.selectSongs,
      clearSelectedSongs: library.clearSelectedSongs,
    })),
  )

  const genres = useMemo(
    () => ['all', ...new Set(state.songs.map((song) => song.genre))],
    [state.songs],
  )

  const filteredSongs = useMemo(() => {
    const query = state.search.trim().toLowerCase()

    return state.songs
      .filter((song) =>
        query
          ? [song.title, song.artist, song.album, song.genre].some((value) =>
              value.toLowerCase().includes(query),
            )
          : true,
      )
      .filter((song) =>
        state.genreFilter === 'all' ? true : song.genre === state.genreFilter,
      )
      .filter((song) => {
        if (state.lyricsFilter === 'all') {
          return true
        }

        return state.lyricsFilter === 'with'
          ? Boolean(song.lyrics.trim())
          : !song.lyrics.trim()
      })
      .filter((song) => {
        switch (state.assetFilter) {
          case 'complete':
            return ['audio', 'cover', 'lyrics', 'background'].every((kind) =>
              hasAsset(song, kind as keyof Song['assets']),
            )
          case 'missing-audio':
            return !hasAsset(song, 'audio')
          case 'missing-cover':
            return !hasAsset(song, 'cover')
          case 'missing-lyrics':
            return !hasAsset(song, 'lyrics')
          case 'missing-background':
            return !hasAsset(song, 'background')
          default:
            return true
        }
      })
      .sort((left, right) => {
        const direction = state.sortOrder === 'asc' ? 1 : -1
        const leftValue = left[state.sortBy]
        const rightValue = right[state.sortBy]

        if (leftValue === null || rightValue === null) {
          return String(leftValue ?? '').localeCompare(String(rightValue ?? '')) * direction
        }

        if (typeof leftValue === 'number' && typeof rightValue === 'number') {
          return (leftValue - rightValue) * direction
        }

        return String(leftValue).localeCompare(String(rightValue)) * direction
      })
  }, [state])

  const totalPages = Math.max(1, Math.ceil(filteredSongs.length / state.pageSize))
  const currentPage = Math.min(state.currentPage, totalPages)
  const paginatedSongs = filteredSongs.slice(
    (currentPage - 1) * state.pageSize,
    currentPage * state.pageSize,
  )
  const selectedSongs = state.songs.filter((song) => state.selectedSongIds.includes(song.id))

  return {
    ...state,
    genres,
    totalPages,
    currentPage,
    filteredSongs,
    paginatedSongs,
    selectedSongs,
  }
}
