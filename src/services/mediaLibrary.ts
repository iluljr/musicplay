import { mockSongs } from '@/mocks/songs'
import { mediaStorage } from '@/services/mediaStorage'
import type { ImportSongDraft, StoredAssetRecord, StoredSongRecord } from '@/types/media'
import type { Song, SongAsset, SongAssetKind, SongAssets } from '@/types/song'

const assetUrlCache = new Map<string, string>()
const SEED_STATUS_STORAGE_KEY = 'musicplay.media-library.seeded'

const isSeedStatusStored = () => {
  if (typeof window === 'undefined') {
    return false
  }

  return window.localStorage.getItem(SEED_STATUS_STORAGE_KEY) === '1'
}

const markSeedStatusStored = () => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(SEED_STATUS_STORAGE_KEY, '1')
}

const ensureAssetUrl = (asset: StoredAssetRecord) => {
  const cached = assetUrlCache.get(asset.id)

  if (cached) {
    return cached
  }

  const url = URL.createObjectURL(asset.blob)
  assetUrlCache.set(asset.id, url)
  return url
}

const createEmptyAssets = (): SongAssets => ({
  audio: null,
  cover: null,
  lyrics: null,
  background: null,
})

const toSongAsset = (asset: StoredAssetRecord): SongAsset => ({
  id: asset.id,
  kind: asset.kind,
  fileName: asset.fileName,
  mimeType: asset.mimeType,
  size: asset.size,
  source: 'imported',
})

const toStoredSongRecord = (song: Song): StoredSongRecord => ({
  id: song.id,
  title: song.title,
  artist: song.artist,
  album: song.album,
  genre: song.genre,
  year: song.year,
  duration: song.duration,
  themeColor: song.themeColor,
  favorite: song.favorite,
  playCount: song.playCount,
  lastPlayed: song.lastPlayed,
  createdAt: song.createdAt,
  updatedAt: song.updatedAt,
  source: 'mock',
  assetIds: {
    audio: null,
    cover: null,
    lyrics: null,
    background: null,
  },
  staticMedia: {
    audio: song.audio,
    backgroundImage: song.backgroundImage,
    backgroundVideo: song.backgroundVideo,
    cover: song.cover,
    lyrics: song.lyrics,
  },
})

const hydrateSong = async (
  songRecord: StoredSongRecord,
  assetsById: Map<string, StoredAssetRecord>,
): Promise<Song> => {
  const assets = createEmptyAssets()
  let audio = songRecord.staticMedia.audio
  let cover = songRecord.staticMedia.cover
  let lyrics = songRecord.staticMedia.lyrics
  let backgroundImage = songRecord.staticMedia.backgroundImage
  let backgroundVideo = songRecord.staticMedia.backgroundVideo

  for (const kind of Object.keys(songRecord.assetIds) as SongAssetKind[]) {
    const assetId = songRecord.assetIds[kind]

    if (!assetId) {
      continue
    }

    const asset = assetsById.get(assetId)

    if (!asset) {
      continue
    }

    assets[kind] = toSongAsset(asset)

    if (kind === 'audio') {
      audio = ensureAssetUrl(asset)
    }

    if (kind === 'cover') {
      cover = ensureAssetUrl(asset)
    }

    if (kind === 'lyrics') {
      lyrics = await asset.blob.text()
    }

    if (kind === 'background') {
      const backgroundUrl = ensureAssetUrl(asset)

      if (asset.mimeType.startsWith('video/')) {
        backgroundVideo = backgroundUrl
      } else {
        backgroundImage = backgroundUrl
      }
    }
  }

  return {
    id: songRecord.id,
    title: songRecord.title,
    artist: songRecord.artist,
    album: songRecord.album,
    genre: songRecord.genre,
    year: songRecord.year,
    duration: songRecord.duration,
    cover,
    audio,
    lyrics,
    backgroundVideo,
    backgroundImage,
    themeColor: songRecord.themeColor,
    favorite: songRecord.favorite,
    playCount: songRecord.playCount,
    lastPlayed: songRecord.lastPlayed,
    createdAt: songRecord.createdAt,
    updatedAt: songRecord.updatedAt,
    assets,
  }
}

const createStoredSongFromDraft = async (draft: ImportSongDraft) => {
  const timestamp = new Date().toISOString()
  const songId = `song-${crypto.randomUUID()}`
  const assetIds: StoredSongRecord['assetIds'] = {
    audio: null,
    cover: null,
    lyrics: null,
    background: null,
  }

  const assets: StoredAssetRecord[] = []

  for (const [kind, scannedFile] of Object.entries(draft.files) as Array<
    [SongAssetKind, ImportSongDraft['files'][SongAssetKind]]
  >) {
    if (!scannedFile) {
      continue
    }

    const assetId = `asset-${crypto.randomUUID()}`
    assetIds[kind] = assetId

    assets.push({
      id: assetId,
      songId,
      kind,
      fileName: scannedFile.fileName,
      mimeType: scannedFile.file.type || 'application/octet-stream',
      size: scannedFile.file.size,
      blob: scannedFile.file,
      createdAt: timestamp,
    })
  }

  const song: StoredSongRecord = {
    id: songId,
    title: draft.title,
    artist: draft.artist,
    album: draft.album,
    genre: draft.genre,
    year: draft.year,
    duration: draft.duration,
    themeColor: draft.themeColor,
    favorite: false,
    playCount: 0,
    lastPlayed: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    source: 'imported',
    assetIds,
    staticMedia: {
      audio: '',
      cover: `gradient://${draft.themeColor.replace('#', '')}/08142d`,
      lyrics: '',
      backgroundImage: '',
      backgroundVideo: '',
    },
  }

  return { assets, song }
}

export const mediaLibraryService = {
  async ensureSeedLibrary() {
    const existingSongs = await mediaStorage.getSongs()

    if (existingSongs.length > 0) {
      markSeedStatusStored()
      return
    }

    if (isSeedStatusStored()) {
      return
    }

    await mediaStorage.putSongs(mockSongs.map(toStoredSongRecord))
    markSeedStatusStored()
  },
  async listSongs() {
    await this.ensureSeedLibrary()

    const [songRecords, assetRecords] = await Promise.all([
      mediaStorage.getSongs(),
      mediaStorage.getAssets(),
    ])
    const assetsById = new Map(assetRecords.map((asset) => [asset.id, asset]))

    return Promise.all(
      songRecords
        .sort((left, right) => left.title.localeCompare(right.title))
        .map((songRecord) => hydrateSong(songRecord, assetsById)),
    )
  },
  async importSongs(drafts: ImportSongDraft[]) {
    const created = await Promise.all(drafts.map((draft) => createStoredSongFromDraft(draft)))

    await mediaStorage.putAssets(created.flatMap((entry) => entry.assets))
    await mediaStorage.putSongs(created.map((entry) => entry.song))

    return this.listSongs()
  },
  async updateSong(
    songId: string,
    updates: Partial<Pick<Song, 'title' | 'artist' | 'album' | 'genre' | 'year' | 'favorite'>>,
  ) {
    const songs = await mediaStorage.getSongs()
    const song = songs.find((entry) => entry.id === songId)

    if (!song) {
      return this.listSongs()
    }

    const nextSong: StoredSongRecord = {
      ...song,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    await mediaStorage.putSongs([nextSong])
    return this.listSongs()
  },
  async deleteSongs(songIds: string[]) {
    const songs = await mediaStorage.getSongs()
    const assets = await mediaStorage.getAssets()
    const assetIds = assets
      .filter((asset) => songIds.includes(asset.songId))
      .map((asset) => asset.id)

    await mediaStorage.deleteSongs(songIds)
    await mediaStorage.deleteAssets(assetIds)

    return this.listSongs()
  },
  async deleteAllSongs() {
    await mediaStorage.clearLibrary()
    markSeedStatusStored()

    return this.listSongs()
  },
  async duplicateSongs(songIds: string[]) {
    const songs = await mediaStorage.getSongs()
    const assets = await mediaStorage.getAssets()
    const selectedSongs = songs.filter((song) => songIds.includes(song.id))
    const duplicatedSongs: StoredSongRecord[] = []
    const duplicatedAssets: StoredAssetRecord[] = []

    for (const song of selectedSongs) {
      const nextSongId = `song-${crypto.randomUUID()}`
      const assetIds: StoredSongRecord['assetIds'] = {
        audio: null,
        cover: null,
        lyrics: null,
        background: null,
      }

      for (const kind of Object.keys(song.assetIds) as SongAssetKind[]) {
        const assetId = song.assetIds[kind]

        if (!assetId) {
          continue
        }

        const asset = assets.find((entry) => entry.id === assetId)

        if (!asset) {
          continue
        }

        const nextAssetId = `asset-${crypto.randomUUID()}`
        assetIds[kind] = nextAssetId
        duplicatedAssets.push({
          ...asset,
          id: nextAssetId,
          songId: nextSongId,
        })
      }

      duplicatedSongs.push({
        ...song,
        id: nextSongId,
        title: `${song.title} Copy`,
        assetIds,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }

    await mediaStorage.putAssets(duplicatedAssets)
    await mediaStorage.putSongs(duplicatedSongs)

    return this.listSongs()
  },
}
