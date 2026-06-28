import type { AppSettings } from '@/types/settings'

export const buildObsSearchParams = (settings: AppSettings) => {
  const searchParams = new URLSearchParams()

  searchParams.set('overlay', '1')

  if (settings.obsMinimal) {
    searchParams.set('minimal', '1')
  }

  searchParams.set('cover', settings.obsShowCover ? '1' : '0')
  searchParams.set('controls', settings.obsShowControls ? '1' : '0')
  searchParams.set('playlist', settings.obsShowPlaylist ? '1' : '0')
  searchParams.set('progress', settings.obsShowProgress ? '1' : '0')
  searchParams.set('lyrics', settings.obsShowLyrics ? '1' : '0')

  return searchParams
}

export const buildObsSourceUrl = (settings: AppSettings) => {
  const origin = window.location.origin
  const pathname = `${window.location.pathname.replace(/\/+$/, '') || ''}/`
    .replace(/\/+$/, '/')
  const searchParams = buildObsSearchParams(settings)

  return `${origin}${pathname}?${searchParams.toString()}`
}
