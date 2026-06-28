import { useMemo, useState } from 'react'
import {
  Copy,
  Grid2X2,
  Import,
  List,
  Pencil,
  RefreshCcw,
  Search,
  Trash2,
} from 'lucide-react'
import { GlassPanel } from '@/components/common/GlassPanel'
import { ImportWizard } from '@/components/library/ImportWizard'
import { LibrarySongCard } from '@/components/library/LibrarySongCard'
import { LibrarySongRow } from '@/components/library/LibrarySongRow'
import { MetadataEditorDialog } from '@/components/library/MetadataEditorDialog'
import { useLibraryCollection } from '@/hooks/useLibraryCollection'
import { useMediaLibraryManager } from '@/hooks/useMediaLibraryManager'
import { usePlayerStore } from '@/stores/playerStore'
import type { Song } from '@/types/song'

const sortOptions = [
  { value: 'title', label: 'Title' },
  { value: 'artist', label: 'Artist' },
  { value: 'album', label: 'Album' },
  { value: 'duration', label: 'Duration' },
  { value: 'playCount', label: 'Play Count' },
  { value: 'updatedAt', label: 'Updated' },
  { value: 'lastPlayed', label: 'Last Played' },
] as const

const pageSizeOptions = [5, 10, 15, 20, 25] as const

const selectClassName =
  'rounded-2xl border border-white/10 bg-base-900/90 px-4 py-3 text-sm text-white outline-none transition-colors hover:border-white/20 focus:border-accent-300/45 [color-scheme:dark]'

export const LibraryPage = () => {
  const library = useLibraryCollection()
  const playSongById = usePlayerStore((state) => state.playSongById)
  const manager = useMediaLibraryManager()
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [editingSong, setEditingSong] = useState<Song | null>(null)

  const allVisibleSelected =
    library.paginatedSongs.length > 0 &&
    library.paginatedSongs.every((song) => library.selectedSongIds.includes(song.id))

  const bulkTargetIds = useMemo(
    () => library.selectedSongs.map((song) => song.id),
    [library.selectedSongs],
  )

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-white/40">Library</p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">
            Lightroom-style media management for song assets
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-white/45 sm:text-base">
            Import audio, lyrics, covers, and backgrounds through the UI. Files
            are grouped into complete song assets automatically and kept ready for
            playback, playlists, and future storage providers.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white/70"
            onClick={() => void manager.refreshLibrary()}
            type="button"
          >
            <span className="inline-flex items-center gap-2">
              <RefreshCcw className={`h-4 w-4 ${manager.isMutating ? 'animate-spin' : ''}`} />
              Refresh
            </span>
          </button>
          <button
            className="rounded-full border border-accent-300/30 bg-accent-400/12 px-4 py-2.5 text-sm text-accent-100"
            onClick={() => setIsImportOpen(true)}
            type="button"
          >
            <span className="inline-flex items-center gap-2">
              <Import className="h-4 w-4" />
              Import Music
            </span>
          </button>
        </div>
      </div>

      <GlassPanel className="p-4 sm:p-5">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_180px_180px_180px_auto]">
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <Search className="h-4 w-4 text-white/35" />
            <input
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
              onChange={(event) => library.setSearch(event.target.value)}
              placeholder="Search songs, artists, albums, genres"
              value={library.search}
            />
          </label>

          <select
            className={selectClassName}
            onChange={(event) => library.setGenreFilter(event.target.value)}
            value={library.genreFilter}
          >
            {library.genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre === 'all' ? 'All genres' : genre}
              </option>
            ))}
          </select>

          <select
            className={selectClassName}
            onChange={(event) =>
              library.setLyricsFilter(event.target.value as typeof library.lyricsFilter)
            }
            value={library.lyricsFilter}
          >
            <option value="all">All lyrics</option>
            <option value="with">With lyrics</option>
            <option value="without">Without lyrics</option>
          </select>

          <select
            className={selectClassName}
            onChange={(event) =>
              library.setAssetFilter(event.target.value as typeof library.assetFilter)
            }
            value={library.assetFilter}
          >
            <option value="all">All asset states</option>
            <option value="complete">Complete assets</option>
            <option value="missing-audio">Missing audio</option>
            <option value="missing-cover">Missing cover</option>
            <option value="missing-lyrics">Missing lyrics</option>
            <option value="missing-background">Missing background</option>
          </select>

          <div className="flex items-center gap-2">
            <button
              className={`rounded-full border px-3 py-3 ${
                library.viewMode === 'grid'
                  ? 'border-accent-300/30 bg-accent-400/12 text-accent-100'
                  : 'border-white/10 bg-white/[0.03] text-white/55'
              }`}
              onClick={() => library.setViewMode('grid')}
              type="button"
            >
              <Grid2X2 className="h-4 w-4" />
            </button>
            <button
              className={`rounded-full border px-3 py-3 ${
                library.viewMode === 'list'
                  ? 'border-accent-300/30 bg-accent-400/12 text-accent-100'
                  : 'border-white/10 bg-white/[0.03] text-white/55'
              }`}
              onClick={() => library.setViewMode('list')}
              type="button"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </GlassPanel>

      <GlassPanel className="p-4 sm:p-5">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_220px_auto_auto]">
          <select
            className={selectClassName}
            onChange={(event) => library.setSortBy(event.target.value as typeof library.sortBy)}
            value={library.sortBy}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                Sort by {option.label}
              </option>
            ))}
          </select>

          <button
            className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/65"
            onClick={() =>
              library.selectSongs(
                allVisibleSelected ? [] : library.paginatedSongs.map((song) => song.id),
              )
            }
            type="button"
          >
            {allVisibleSelected ? 'Clear visible selection' : 'Select visible'}
          </button>

          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/65 disabled:opacity-40"
              disabled={bulkTargetIds.length !== 1}
              onClick={() => setEditingSong(library.selectedSongs[0] ?? null)}
              type="button"
            >
              <span className="inline-flex items-center gap-2">
                <Pencil className="h-4 w-4" />
                Edit Metadata
              </span>
            </button>
            <button
              className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/65 disabled:opacity-40"
              disabled={bulkTargetIds.length === 0}
              onClick={() => void manager.duplicateSongs(bulkTargetIds)}
              type="button"
            >
              <span className="inline-flex items-center gap-2">
                <Copy className="h-4 w-4" />
                Duplicate
              </span>
            </button>
            <button
              className="rounded-full border border-red-400/25 bg-red-500/10 px-4 py-2 text-sm text-red-100 disabled:opacity-40"
              disabled={bulkTargetIds.length === 0}
              onClick={async () => {
                await manager.deleteSongs(bulkTargetIds)
                library.clearSelectedSongs()
              }}
              type="button"
            >
              <span className="inline-flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Delete
              </span>
            </button>
            <button
              className="rounded-full border border-red-400/25 bg-red-500/10 px-4 py-2 text-sm text-red-100 disabled:opacity-40"
              disabled={library.songs.length === 0 || manager.isMutating}
              onClick={async () => {
                const isConfirmed = window.confirm(
                  'Delete all songs and imported assets from the library? This cannot be undone.',
                )

                if (!isConfirmed) {
                  return
                }

                await manager.deleteAllSongs()
                library.clearSelectedSongs()
              }}
              type="button"
            >
              <span className="inline-flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Delete All
              </span>
            </button>
          </div>

          <div className="flex items-center justify-end text-sm text-white/45">
            {library.selectedSongIds.length} selected
          </div>
        </div>
      </GlassPanel>

      <GlassPanel className="overflow-hidden">
        {library.loading ? (
          <div
            className={`grid gap-4 p-5 ${
              library.viewMode === 'grid'
                ? 'sm:grid-cols-2 2xl:grid-cols-3'
                : 'grid-cols-1'
            }`}
          >
            {Array.from({ length: library.viewMode === 'grid' ? 6 : 5 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-4"
              >
                <div className="h-40 rounded-2xl bg-white/[0.06]" />
                <div className="mt-4 space-y-3">
                  <div className="h-4 rounded-full bg-white/[0.06]" />
                  <div className="h-4 w-2/3 rounded-full bg-white/[0.06]" />
                  <div className="h-10 rounded-2xl bg-white/[0.06]" />
                </div>
              </div>
            ))}
          </div>
        ) : library.paginatedSongs.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-2xl font-medium text-white">No media assets matched</p>
            <p className="max-w-xl text-sm text-white/40">
              Import music files to build the library, or adjust the current search
              and filters to surface another asset group.
            </p>
            <button
              className="rounded-full border border-accent-300/30 bg-accent-400/12 px-5 py-2 text-sm text-accent-100"
              onClick={() => setIsImportOpen(true)}
              type="button"
            >
              Import Music
            </button>
          </div>
        ) : library.viewMode === 'grid' ? (
          <div className="grid gap-4 p-4 sm:grid-cols-2 2xl:grid-cols-3">
            {library.paginatedSongs.map((song) => (
              <LibrarySongCard
                key={song.id}
                isSelected={library.selectedSongIds.includes(song.id)}
                onDelete={(songId) => void manager.deleteSongs([songId])}
                onDuplicate={(songId) => void manager.duplicateSongs([songId])}
                onEdit={setEditingSong}
                onPlay={playSongById}
                onToggleSelected={library.toggleSelectedSong}
                song={song}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3 p-4 sm:p-5">
            {library.paginatedSongs.map((song) => (
              <LibrarySongRow
                key={song.id}
                isSelected={library.selectedSongIds.includes(song.id)}
                onDelete={(songId) => void manager.deleteSongs([songId])}
                onDuplicate={(songId) => void manager.duplicateSongs([songId])}
                onEdit={setEditingSong}
                onPlay={playSongById}
                onToggleSelected={library.toggleSelectedSong}
                song={song}
              />
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-4 text-sm text-white/45">
          <div className="flex flex-wrap items-center gap-3">
            <span>
              Page {library.currentPage} of {library.totalPages}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-white/35">Per page</span>
              <select
                className={selectClassName}
                onChange={(event) => library.setPageSize(Number(event.target.value))}
                value={library.pageSize}
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="rounded-full border border-white/10 px-4 py-2 disabled:opacity-40"
              disabled={library.currentPage === 1}
              onClick={() => library.setCurrentPage(library.currentPage - 1)}
              type="button"
            >
              Previous
            </button>
            <button
              className="rounded-full border border-white/10 px-4 py-2 disabled:opacity-40"
              disabled={library.currentPage === library.totalPages}
              onClick={() => library.setCurrentPage(library.currentPage + 1)}
              type="button"
            >
              Next
            </button>
          </div>
        </div>
      </GlassPanel>

      <ImportWizard
        isOpen={isImportOpen}
        isSubmitting={manager.isMutating}
        onClose={() => setIsImportOpen(false)}
        onConfirm={manager.importSongs}
      />
      <MetadataEditorDialog
        isOpen={Boolean(editingSong)}
        onClose={() => setEditingSong(null)}
        onSave={manager.updateSongMetadata}
        song={editingSong}
      />
    </div>
  )
}
