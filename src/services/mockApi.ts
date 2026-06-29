import { backendApi } from '@/services/backendApi'

export const mockApi = {
  async getSongs() {
    return backendApi.getSongs()
  },
  async getPlaylists() {
    return backendApi.getPlaylists()
  },
  async getSettings() {
    return backendApi.getSettings()
  },
}
