import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
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

  return useMemo(() => {
    const searchParams = new URLSearchParams(location.search)
    const isOverlay = parseBooleanParam(searchParams.get('overlay'), false)
    const isMinimal = parseBooleanParam(searchParams.get('minimal'), false)

    const showCover = parseBooleanParam(searchParams.get('cover'), true)
    const showControls = parseBooleanParam(searchParams.get('controls'), !isMinimal)
    const showPlaylist = parseBooleanParam(searchParams.get('playlist'), !isMinimal)
    const showProgress = parseBooleanParam(searchParams.get('progress'), !isMinimal)
    const showLyrics = parseBooleanParam(searchParams.get('lyrics'), !isMinimal)

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
    }
  }, [location.search])
}
