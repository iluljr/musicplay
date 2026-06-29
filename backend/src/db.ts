import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'
import { seedPlaylists, seedSongs } from './seed.js'
import type { Playlist, Song, SongAsset, SongAssetKind } from './types.js'

const dataDir = path.resolve(process.cwd(), 'data')
const uploadsDir = path.resolve(process.cwd(), 'uploads')
const databasePath = path.join(dataDir, 'musicplay.db')

fs.mkdirSync(dataDir, { recursive: true })
fs.mkdirSync(uploadsDir, { recursive: true })

const database = new Database(databasePath)

database.exec(`
  CREATE TABLE IF NOT EXISTS songs (
    id TEXT PRIMARY KEY,
    json TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS playlists (
    id TEXT PRIMARY KEY,
    json TEXT NOT NULL
  );
`)

const countSongs = database.prepare('SELECT COUNT(*) as count FROM songs').get() as { count: number }
if (countSongs.count === 0) {
  const insertSong = database.prepare('INSERT INTO songs (id, json) VALUES (?, ?)')
  for (const song of seedSongs) {
    insertSong.run(song.id, JSON.stringify(song))
  }
}

const countPlaylists = database.prepare('SELECT COUNT(*) as count FROM playlists').get() as { count: number }
if (countPlaylists.count === 0) {
  const insertPlaylist = database.prepare('INSERT INTO playlists (id, json) VALUES (?, ?)')
  for (const playlist of seedPlaylists) {
    insertPlaylist.run(playlist.id, JSON.stringify(playlist))
  }
}

const songUrlPrefix = '/uploads'

const removeSongUploadDirectory = (songId: string) => {
  const songDirectory = path.resolve(uploadsDir, songId)

  if (!songDirectory.startsWith(uploadsDir)) {
    return
  }

  fs.rmSync(songDirectory, { recursive: true, force: true })
}

const clearUploadsDirectory = () => {
  for (const entry of fs.readdirSync(uploadsDir, { withFileTypes: true })) {
    const targetPath = path.resolve(uploadsDir, entry.name)

    if (!targetPath.startsWith(uploadsDir)) {
      continue
    }

    fs.rmSync(targetPath, { recursive: true, force: true })
  }
}

const normalizeAssetUrls = (song: Song): Song => ({
  ...song,
  audio: song.audio.startsWith('/') ? song.audio : song.audio,
  cover: song.cover.startsWith('/') ? song.cover : song.cover,
  backgroundImage: song.backgroundImage.startsWith('/') ? song.backgroundImage : song.backgroundImage,
  backgroundVideo: song.backgroundVideo.startsWith('/') ? song.backgroundVideo : song.backgroundVideo,
})

const readCollection = <T>(table: 'songs' | 'playlists') =>
  database
    .prepare(`SELECT json FROM ${table}`)
    .all()
    .map((row) => JSON.parse((row as { json: string }).json) as T)

const writeSong = database.prepare('INSERT OR REPLACE INTO songs (id, json) VALUES (?, ?)')
const writePlaylist = database.prepare('INSERT OR REPLACE INTO playlists (id, json) VALUES (?, ?)')

export const uploadsRoot = uploadsDir

export const db = {
  listSongs(): Song[] {
    return readCollection<Song>('songs')
      .map(normalizeAssetUrls)
      .sort((left, right) => left.title.localeCompare(right.title))
  },
  getSong(songId: string) {
    const row = database.prepare('SELECT json FROM songs WHERE id = ?').get(songId) as { json: string } | undefined
    return row ? normalizeAssetUrls(JSON.parse(row.json) as Song) : null
  },
  saveSong(song: Song) {
    writeSong.run(song.id, JSON.stringify(song))
  },
  saveSongs(songs: Song[]) {
    const transaction = database.transaction((items: Song[]) => {
      for (const song of items) {
        writeSong.run(song.id, JSON.stringify(song))
      }
    })
    transaction(songs)
  },
  deleteSong(songId: string) {
    database.prepare('DELETE FROM songs WHERE id = ?').run(songId)
    removeSongUploadDirectory(songId)
  },
  clearSongs() {
    database.prepare('DELETE FROM songs').run()
    clearUploadsDirectory()
  },
  listPlaylists(): Playlist[] {
    return readCollection<Playlist>('playlists').sort((left, right) => left.name.localeCompare(right.name))
  },
  savePlaylist(playlist: Playlist) {
    writePlaylist.run(playlist.id, JSON.stringify(playlist))
  },
  savePlaylists(playlists: Playlist[]) {
    const transaction = database.transaction((items: Playlist[]) => {
      for (const playlist of items) {
        writePlaylist.run(playlist.id, JSON.stringify(playlist))
      }
    })
    transaction(playlists)
  },
  deletePlaylist(playlistId: string) {
    database.prepare('DELETE FROM playlists WHERE id = ?').run(playlistId)
  },
}

export const createUploadedSong = ({
  metadata,
  assetDescriptors,
}: {
  metadata: Pick<Song, 'title' | 'artist' | 'album' | 'genre' | 'year' | 'duration' | 'themeColor'>
  assetDescriptors: Partial<Record<SongAssetKind, SongAsset & { url: string; text?: string }>>
}): Song => {
  const timestamp = new Date().toISOString()
  const assets: Record<SongAssetKind, SongAsset | null> = {
    audio: assetDescriptors.audio ?? null,
    cover: assetDescriptors.cover ?? null,
    lyrics: assetDescriptors.lyrics ?? null,
    background: assetDescriptors.background ?? null,
  }

  const coverUrl = assetDescriptors.cover?.url ?? `gradient://${metadata.themeColor.replace('#', '')}/08142d`
  const background = assetDescriptors.background?.url ?? ''

  return {
    id: `song-${crypto.randomUUID()}`,
    title: metadata.title,
    artist: metadata.artist,
    album: metadata.album,
    genre: metadata.genre,
    year: metadata.year,
    duration: metadata.duration,
    cover: coverUrl,
    audio: assetDescriptors.audio?.url ?? '',
    lyrics: assetDescriptors.lyrics?.text ?? '',
    backgroundVideo: assetDescriptors.background?.mimeType.startsWith('video/') ? background : '',
    backgroundImage: assetDescriptors.background && !assetDescriptors.background.mimeType.startsWith('video/')
      ? background
      : '',
    themeColor: metadata.themeColor,
    favorite: false,
    playCount: 0,
    lastPlayed: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    assets,
  }
}

export const createUploadAssetUrl = (songId: string, fileName: string) =>
  `${songUrlPrefix}/${songId}/${encodeURIComponent(fileName)}`
