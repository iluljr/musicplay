export type SongAssetKind = 'audio' | 'cover' | 'lyrics' | 'background'

export type SongAsset = {
  id: string
  kind: SongAssetKind
  fileName: string
  mimeType: string
  size: number
  source: 'mock' | 'imported'
}

export type SongAssets = Record<SongAssetKind, SongAsset | null>

export type Song = {
  id: string
  title: string
  artist: string
  album: string
  genre: string
  year: number
  duration: number
  cover: string
  audio: string
  lyrics: string
  backgroundVideo: string
  backgroundImage: string
  themeColor: string
  favorite: boolean
  playCount: number
  lastPlayed: string | null
  createdAt: string
  updatedAt: string
  assets: SongAssets
}
