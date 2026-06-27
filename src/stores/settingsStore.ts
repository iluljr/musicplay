import { create } from 'zustand'
import type { AppSettings } from '@/types/settings'

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
  setSettings: (settings) => set({ settings }),
  setLoading: (loading) => set({ loading }),
  updateSetting: (key, value) =>
    set((state) => ({
      settings: state.settings ? { ...state.settings, [key]: value } : state.settings,
    })),
}))
