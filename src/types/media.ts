import type { SongAssetKind } from '@/types/song'

export type ImportableAssetKind = SongAssetKind

export type StoredAssetRecord = {
  id: string
  songId: string
  kind: ImportableAssetKind
  fileName: string
  mimeType: string
  size: number
  blob: Blob
  createdAt: string
}

export type StoredSongRecord = {
  id: string
  title: string
  artist: string
  album: string
  genre: string
  year: number
  duration: number
  themeColor: string
  favorite: boolean
  playCount: number
  lastPlayed: string | null
  createdAt: string
  updatedAt: string
  source: 'mock' | 'imported'
  assetIds: Record<ImportableAssetKind, string | null>
  staticMedia: {
    cover: string
    audio: string
    lyrics: string
    backgroundVideo: string
    backgroundImage: string
  }
}

export type ImportScannedFile = {
  id: string
  baseName: string
  file: File
  fileName: string
  kind: ImportableAssetKind
}

export type ImportSongDraft = {
  id: string
  baseName: string
  title: string
  artist: string
  album: string
  genre: string
  year: number
  duration: number
  themeColor: string
  files: Partial<Record<ImportableAssetKind, ImportScannedFile>>
  warnings: string[]
}
