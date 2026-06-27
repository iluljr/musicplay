import { startTransition, useState } from 'react'
import { mediaLibraryService } from '@/services/mediaLibrary'
import type { ImportSongDraft } from '@/types/media'
import type { Song } from '@/types/song'
import { useLibraryStore } from '@/stores/libraryStore'
import { usePlayerStore } from '@/stores/playerStore'

export const useMediaLibraryManager = () => {
  const [isMutating, setIsMutating] = useState(false)
  const setSongs = useLibraryStore((state) => state.setSongs)
  const setTracks = usePlayerStore((state) => state.setTracks)

  const syncSongs = (songs: Song[]) => {
    startTransition(() => {
      setSongs(songs)
      setTracks(songs)
    })
  }

  const withMutation = async <T>(callback: () => Promise<T>) => {
    setIsMutating(true)

    try {
      return await callback()
    } finally {
      setIsMutating(false)
    }
  }

  return {
    isMutating,
    refreshLibrary: () =>
      withMutation(async () => {
        const songs = await mediaLibraryService.listSongs()
        syncSongs(songs)
        return songs
      }),
    importSongs: (drafts: ImportSongDraft[]) =>
      withMutation(async () => {
        const songs = await mediaLibraryService.importSongs(drafts)
        syncSongs(songs)
        return songs
      }),
    deleteSongs: (songIds: string[]) =>
      withMutation(async () => {
        const songs = await mediaLibraryService.deleteSongs(songIds)
        syncSongs(songs)
        return songs
      }),
    duplicateSongs: (songIds: string[]) =>
      withMutation(async () => {
        const songs = await mediaLibraryService.duplicateSongs(songIds)
        syncSongs(songs)
        return songs
      }),
    updateSongMetadata: (
      songId: string,
      updates: Partial<Pick<Song, 'title' | 'artist' | 'album' | 'genre' | 'year' | 'favorite'>>,
    ) =>
      withMutation(async () => {
        const songs = await mediaLibraryService.updateSong(songId, updates)
        syncSongs(songs)
        return songs
      }),
  }
}
