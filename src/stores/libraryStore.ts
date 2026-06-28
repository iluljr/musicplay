import { create } from 'zustand'
import type { Song } from '@/types/song'

export type LyricsFilter = 'all' | 'with' | 'without'
export type AssetFilter = 'all' | 'complete' | 'missing-audio' | 'missing-cover' | 'missing-lyrics' | 'missing-background'
export type LibraryViewMode = 'grid' | 'list'
export type SongSortKey =
  | 'title'
  | 'artist'
  | 'album'
  | 'duration'
  | 'year'
  | 'playCount'
  | 'updatedAt'
  | 'lastPlayed'

type LibraryState = {
  songs: Song[]
  loading: boolean
  search: string
  genreFilter: string
  lyricsFilter: LyricsFilter
  assetFilter: AssetFilter
  sortBy: SongSortKey
  sortOrder: 'asc' | 'desc'
  currentPage: number
  pageSize: number
  viewMode: LibraryViewMode
  selectedSongIds: string[]
  setSongs: (songs: Song[]) => void
  setLoading: (loading: boolean) => void
  setSearch: (search: string) => void
  setGenreFilter: (genreFilter: string) => void
  setLyricsFilter: (lyricsFilter: LyricsFilter) => void
  setAssetFilter: (assetFilter: AssetFilter) => void
  setSortBy: (sortBy: SongSortKey) => void
  setCurrentPage: (currentPage: number) => void
  setPageSize: (pageSize: number) => void
  setViewMode: (viewMode: LibraryViewMode) => void
  toggleSelectedSong: (songId: string) => void
  selectSongs: (songIds: string[]) => void
  clearSelectedSongs: () => void
}

export const useLibraryStore = create<LibraryState>((set) => ({
  songs: [],
  loading: true,
  search: '',
  genreFilter: 'all',
  lyricsFilter: 'all',
  assetFilter: 'all',
  sortBy: 'title',
  sortOrder: 'asc',
  currentPage: 1,
  pageSize: 5,
  viewMode: 'grid',
  selectedSongIds: [],
  setSongs: (songs) => set({ songs }),
  setLoading: (loading) => set({ loading }),
  setSearch: (search) => set({ search, currentPage: 1 }),
  setGenreFilter: (genreFilter) => set({ genreFilter, currentPage: 1 }),
  setLyricsFilter: (lyricsFilter) => set({ lyricsFilter, currentPage: 1 }),
  setAssetFilter: (assetFilter) => set({ assetFilter, currentPage: 1 }),
  setSortBy: (sortBy) =>
    set((state) => ({
      sortBy,
      sortOrder:
        state.sortBy === sortBy && state.sortOrder === 'asc' ? 'desc' : 'asc',
    })),
  setCurrentPage: (currentPage) => set({ currentPage }),
  setPageSize: (pageSize) => set({ pageSize, currentPage: 1 }),
  setViewMode: (viewMode) => set({ viewMode }),
  toggleSelectedSong: (songId) =>
    set((state) => ({
      selectedSongIds: state.selectedSongIds.includes(songId)
        ? state.selectedSongIds.filter((id) => id !== songId)
        : [...state.selectedSongIds, songId],
    })),
  selectSongs: (songIds) => set({ selectedSongIds: songIds }),
  clearSelectedSongs: () => set({ selectedSongIds: [] }),
}))
