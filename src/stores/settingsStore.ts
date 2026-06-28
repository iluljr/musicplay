import { create } from 'zustand'
import type { AppSettings } from '@/types/settings'

const SETTINGS_STORAGE_KEY = 'musicplay.settings'

const readStoredSettings = (): Partial<AppSettings> | null => {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const rawValue = window.localStorage.getItem(SETTINGS_STORAGE_KEY)

    if (!rawValue) {
      return null
    }

    return JSON.parse(rawValue) as Partial<AppSettings>
  } catch {
    return null
  }
}

const persistSettings = (settings: AppSettings) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
}

type SettingsState = {
  settings: AppSettings | null
  loading: boolean
  setSettings: (settings: AppSettings) => void
  setLoading: (loading: boolean) => void
  updateSetting: <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  loading: true,
  setSettings: (settings) => {
    const nextSettings = {
      ...settings,
      ...readStoredSettings(),
    }

    persistSettings(nextSettings)
    set({ settings: nextSettings })
  },
  setLoading: (loading) => set({ loading }),
  updateSetting: (key, value) =>
    set((state) => {
      const nextSettings = state.settings
        ? { ...state.settings, [key]: value }
        : state.settings

      if (nextSettings) {
        persistSettings(nextSettings)
      }

      return {
        settings: nextSettings,
      }
    }),
}))
