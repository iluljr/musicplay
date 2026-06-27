import type { ImportScannedFile, ImportableAssetKind } from '@/types/media'

const extensionMap: Record<string, ImportableAssetKind | null> = {
  mp3: 'audio',
  wav: 'audio',
  flac: 'audio',
  ogg: 'audio',
  lrc: 'lyrics',
  jpg: 'cover',
  jpeg: 'cover',
  png: 'cover',
  webp: 'cover',
  mp4: 'background',
  webm: 'background',
}

const backgroundHints = ['background', 'bg', 'backdrop', 'visualizer', 'loop']
const coverHints = ['cover', 'art', 'artwork', 'thumb', 'thumbnail']

export const getFileExtension = (fileName: string) =>
  fileName.split('.').pop()?.toLowerCase() ?? ''

export const inferAssetKind = (fileName: string) => {
  const extension = getFileExtension(fileName)
  const inferredKind = extensionMap[extension]

  if (!inferredKind) {
    return null
  }

  if (inferredKind === 'cover') {
    const lowerCaseName = fileName.toLowerCase()

    if (backgroundHints.some((hint) => lowerCaseName.includes(hint))) {
      return 'background'
    }
  }

  return inferredKind
}

export const normalizeSongBaseName = (fileName: string) => {
  const withoutExtension = fileName.replace(/\.[^/.]+$/, '')

  return withoutExtension
    .replace(/[_-](cover|art|artwork|lyrics|lrc|background|bg|video)$/i, '')
    .replace(/\s+\((cover|art|artwork|lyrics|lrc|background|bg|video)\)$/i, '')
    .trim()
}

export const formatBaseNameAsTitle = (baseName: string) =>
  baseName
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export const inferThemeColorFromName = (value: string) => {
  const palette = ['#7ca1ff', '#ff7a59', '#67e8f9', '#f9a8d4', '#6ee7b7', '#ffb86b']
  const hash = value.split('').reduce((total, character) => total + character.charCodeAt(0), 0)

  return palette[hash % palette.length]
}

export const getCompletenessCount = (
  files: Partial<Record<ImportableAssetKind, ImportScannedFile>>,
) => Object.values(files).filter(Boolean).length

export const inferImageRole = (fileName: string) => {
  const lowerCaseName = fileName.toLowerCase()

  if (backgroundHints.some((hint) => lowerCaseName.includes(hint))) {
    return 'background'
  }

  if (coverHints.some((hint) => lowerCaseName.includes(hint))) {
    return 'cover'
  }

  return 'cover'
}

export const getAssetBadgeLabel = (kind: ImportableAssetKind, hasAsset: boolean) =>
  `${hasAsset ? '✓' : '•'} ${
    kind === 'audio'
      ? 'Audio'
      : kind === 'cover'
        ? 'Cover'
        : kind === 'lyrics'
          ? 'Lyrics'
          : 'Background'
  }`
