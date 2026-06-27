import { mockPlaylists } from '@/mocks/playlists'
import { mockSettings } from '@/mocks/settings'
import { mediaLibraryService } from '@/services/mediaLibrary'

const delay = async (duration = 320) =>
  new Promise((resolve) => window.setTimeout(resolve, duration))

export const mockApi = {
  async getSongs() {
    await delay(420)
    return mediaLibraryService.listSongs()
  },
  async getPlaylists() {
    await delay(380)
    return structuredClone(mockPlaylists)
  },
  async getSettings() {
    await delay(240)
    return structuredClone(mockSettings)
  },
}
