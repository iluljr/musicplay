import { useEffect } from 'react'
import { mockApi } from '@/services/mockApi'
import { useLibraryStore } from '@/stores/libraryStore'
import { usePlayerStore } from '@/stores/playerStore'
import { usePlaylistStore } from '@/stores/playlistStore'
import { useSettingsStore } from '@/stores/settingsStore'

let hasBootstrapped = false

export const useAppBootstrap = () => {
  const setSongs = useLibraryStore((state) => state.setSongs)
  const setLibraryLoading = useLibraryStore((state) => state.setLoading)
  const setTracks = usePlayerStore((state) => state.setTracks)
  const setPlaylists = usePlaylistStore((state) => state.setPlaylists)
  const setPlaylistLoading = usePlaylistStore((state) => state.setLoading)
  const setSettings = useSettingsStore((state) => state.setSettings)
  const setSettingsLoading = useSettingsStore((state) => state.setLoading)

  useEffect(() => {
    if (hasBootstrapped) {
      return
    }

    hasBootstrapped = true

    void Promise.all([
      mockApi.getSongs(),
      mockApi.getPlaylists(),
      mockApi.getSettings(),
    ]).then(([songs, playlists, settings]) => {
      setSongs(songs)
      setTracks(songs)
      setLibraryLoading(false)

      setPlaylists(playlists)
      setPlaylistLoading(false)

      setSettings(settings)
      setSettingsLoading(false)
    })
  }, [
    setLibraryLoading,
    setPlaylists,
    setPlaylistLoading,
    setSettings,
    setSettingsLoading,
    setSongs,
    setTracks,
  ])
}
