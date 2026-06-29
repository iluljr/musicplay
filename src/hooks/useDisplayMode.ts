import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useSettingsStore } from '@/stores/settingsStore'
import type { DisplayMode } from '@/types/display'

const parseBooleanParam = (value: string | null, fallback: boolean) => {
  if (value === null) {
    return fallback
  }

  if (value === '1' || value.toLowerCase() === 'true') {
    return true
  }

  if (value === '0' || value.toLowerCase() === 'false') {
    return false
  }

  return fallback
}

export const useDisplayMode = (): DisplayMode => {
  const location = useLocation()
  const settings = useSettingsStore((state) => state.settings)

  return useMemo(() => {
    const searchParams = new URLSearchParams(location.search)
    const routeOverlay = location.pathname === '/overlay'
    const supportsObsSurface = location.pathname === '/'
    const overlayParam = searchParams.get('overlay')
    const minimalParam = searchParams.get('minimal')
    const overlayFromUrl = parseBooleanParam(overlayParam, false)
    const minimalFromUrl = parseBooleanParam(minimalParam, false)
    const overlaySource =
      routeOverlay
        ? 'url'
        : overlayParam !== null
          ? overlayFromUrl
            ? 'url'
            : 'none'
          : settings?.obsMode && supportsObsSurface
            ? 'settings'
            : 'none'
    const isOverlay = overlaySource !== 'none'
    const isMinimal =
      minimalParam !== null
        ? minimalFromUrl
        : overlaySource === 'settings'
          ? settings?.obsMinimal ?? false
          : false

    const showCover = parseBooleanParam(
      searchParams.get('cover'),
      overlaySource === 'settings' ? (settings?.obsShowCover ?? true) : true,
    )
    const showControls = parseBooleanParam(
      searchParams.get('controls'),
      overlaySource === 'settings'
        ? (settings?.obsShowControls ?? !isMinimal)
        : !isMinimal,
    )
    const showPlaylist = parseBooleanParam(
      searchParams.get('playlist'),
      overlaySource === 'settings'
        ? (settings?.obsShowPlaylist ?? !isMinimal)
        : !isMinimal,
    )
    const showProgress = parseBooleanParam(
      searchParams.get('progress'),
      overlaySource === 'settings'
        ? (settings?.obsShowProgress ?? !isMinimal)
        : !isMinimal,
    )
    const showLyrics = parseBooleanParam(
      searchParams.get('lyrics'),
      overlaySource === 'settings'
        ? (settings?.obsShowLyrics ?? !isMinimal)
        : !isMinimal,
    )

    return {
      isOverlay,
      isMinimal,
      showCover,
      showControls,
      showPlaylist,
      showProgress,
      showLyrics,
      showHero: !isOverlay && !isMinimal,
      transparentBackground: isOverlay,
      compactLayout: isOverlay || isMinimal,
      overlaySource,
    }
  }, [location.pathname, location.search, settings])
}
