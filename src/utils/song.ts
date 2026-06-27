import type { Song } from '@/types/song'

const parseGradientMedia = (value: string, fallback: [string, string]) => {
  if (!value.startsWith('gradient://')) {
    return fallback
  }

  const [, payload] = value.split('gradient://')
  const [first, second] = payload.split('/')

  return [
    first.startsWith('#') ? first : `#${first}`,
    second?.startsWith('#') ? second : `#${second ?? first}`,
  ] as [string, string]
}

export const getSongPalette = (song: Song) =>
  parseGradientMedia(song.cover, [song.themeColor, '#08142d'])

export const getSongBackground = (song: Song) =>
  parseGradientMedia(song.backgroundImage, [song.themeColor, '#08142d'])
