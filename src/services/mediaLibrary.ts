import { backendApi } from '@/services/backendApi'
import type { ImportSongDraft } from '@/types/media'
import type { Song } from '@/types/song'

export const mediaLibraryService = {
  async listSongs() {
    return backendApi.getSongs()
  },
  async importSongs(drafts: ImportSongDraft[]) {
    return backendApi.importSongs(drafts)
  },
  async updateSong(
    songId: string,
    updates: Partial<Pick<Song, 'title' | 'artist' | 'album' | 'genre' | 'year' | 'favorite'>>,
  ) {
    return backendApi.updateSong(songId, updates)
  },
  async deleteSongs(songIds: string[]) {
    await Promise.all(songIds.map((songId) => backendApi.deleteSong(songId)))
    return backendApi.getSongs()
  },
  async deleteAllSongs() {
    return backendApi.deleteAllSongs()
  },
  async duplicateSongs(songIds: string[]) {
    await Promise.all(songIds.map((songId) => backendApi.duplicateSong(songId)))
    return backendApi.getSongs()
  },
}
