import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import staticPlugin from '@fastify/static'
import websocket from '@fastify/websocket'
import Fastify from 'fastify'
import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { createUploadAssetUrl, createUploadedSong, db, uploadsRoot } from './db.js'
import { PlayerStateManager } from './player-state.js'
import type { PlayerCommandMessage, Playlist, SocketOutboundMessage, Song, SongAsset, SongAssetKind } from './types.js'

const port = Number(process.env.PORT ?? 3001)
const host = process.env.HOST ?? '0.0.0.0'
const playerState = new PlayerStateManager()
const maxUploadFileSizeInBytes = 1024 * 1024 * 1024

const app = Fastify({
  logger: true,
  bodyLimit: maxUploadFileSizeInBytes,
})
await app.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})
await app.register(multipart, {
  limits: {
    fileSize: maxUploadFileSizeInBytes,
  },
})
await app.register(websocket)
await app.register(staticPlugin, {
  root: uploadsRoot,
  prefix: '/uploads/',
})

const broadcastSockets = new Set<{ send: (payload: string) => void }>()

const sendSocketMessage = (message: SocketOutboundMessage) => {
  const payload = JSON.stringify(message)
  for (const socket of broadcastSockets) {
    socket.send(payload)
  }
}

const refreshSongs = () => {
  const songs = db.listSongs()
  playerState.setSongs(songs)
  sendSocketMessage({ type: 'songs_updated', songs })
  return songs
}

const refreshPlaylists = () => {
  const playlists = db.listPlaylists()
  sendSocketMessage({ type: 'playlists_updated', playlists })
  return playlists
}

playerState.subscribe((nextState) => {
  sendSocketMessage({ type: 'player_state', playerState: nextState })
})

refreshSongs()

app.get('/health', async () => ({ status: 'ok' }))

app.get('/api/songs', async () => db.listSongs())
app.get('/api/playlists', async () => db.listPlaylists())
app.get('/api/settings', async () => ({
  theme: 'midnight',
  accentColor: '#7ca1ff',
  obsMode: false,
  autoPlay: true,
  loop: true,
  shuffle: false,
  lyricsSize: 30,
  lyricsAnimation: 'cinematic',
  crossfadeDuration: 2.5,
  volume: 72,
  visualizerStyle: 'ambient',
  obsMinimal: false,
  obsShowCover: true,
  obsShowControls: true,
  obsShowPlaylist: false,
  obsShowProgress: true,
  obsShowLyrics: true,
}))

app.post('/api/player/reset', async () => {
  playerState.reset()
  return playerState.getState()
})

app.patch<{ Params: { songId: string }; Body: Partial<Pick<Song, 'title' | 'artist' | 'album' | 'genre' | 'year' | 'favorite'>> }>(
  '/api/songs/:songId',
  async (request, reply) => {
    const song = db.getSong(request.params.songId)
    if (!song) {
      return reply.code(404).send({ message: 'Song not found' })
    }

    const nextSong = {
      ...song,
      ...request.body,
      updatedAt: new Date().toISOString(),
    }

    db.saveSong(nextSong)
    return refreshSongs()
  },
)

app.delete<{ Params: { songId: string } }>('/api/songs/:songId', async (request) => {
  db.deleteSong(request.params.songId)
  return refreshSongs()
})

app.delete('/api/songs', async () => {
  db.clearSongs()
  return refreshSongs()
})

app.post<{ Params: { songId: string } }>('/api/songs/:songId/duplicate', async (request, reply) => {
  const song = db.getSong(request.params.songId)
  if (!song) {
    return reply.code(404).send({ message: 'Song not found' })
  }

  const timestamp = new Date().toISOString()
  const nextSong = {
    ...song,
    id: `song-${randomUUID()}`,
    title: `${song.title} Copy`,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
  db.saveSong(nextSong)
  return refreshSongs()
})

app.post('/api/playlists', async (request) => {
  const body = request.body as { name: string }
  const timestamp = new Date().toISOString()
  const playlist: Playlist = {
    id: `playlist-${randomUUID()}`,
    name: body.name,
    cover: 'gradient://7ca1ff/09131d',
    description: 'New playlist',
    songs: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  }
  db.savePlaylist(playlist)
  return refreshPlaylists()
})

app.patch<{ Params: { playlistId: string } }>('/api/playlists/:playlistId', async (request, reply) => {
  const body = request.body as Partial<Playlist>
  const playlists = db.listPlaylists()
  const playlist = playlists.find((entry) => entry.id === request.params.playlistId)
  if (!playlist) {
    return reply.code(404).send({ message: 'Playlist not found' })
  }
  db.savePlaylist({
    ...playlist,
    ...body,
    updatedAt: new Date().toISOString(),
  })
  return refreshPlaylists()
})

app.delete<{ Params: { playlistId: string } }>('/api/playlists/:playlistId', async (request) => {
  db.deletePlaylist(request.params.playlistId)
  return refreshPlaylists()
})

app.post<{ Params: { playlistId: string } }>('/api/playlists/:playlistId/duplicate', async (request, reply) => {
  const playlists = db.listPlaylists()
  const playlist = playlists.find((entry) => entry.id === request.params.playlistId)
  if (!playlist) {
    return reply.code(404).send({ message: 'Playlist not found' })
  }
  const timestamp = new Date().toISOString()
  db.savePlaylist({
    ...playlist,
    id: `playlist-${randomUUID()}`,
    name: `${playlist.name} Copy`,
    createdAt: timestamp,
    updatedAt: timestamp,
  })
  return refreshPlaylists()
})

app.post<{ Params: { playlistId: string } }>('/api/playlists/:playlistId/reorder', async (request, reply) => {
  const body = request.body as { fromIndex: number; toIndex: number }
  const playlists = db.listPlaylists()
  const playlist = playlists.find((entry) => entry.id === request.params.playlistId)
  if (!playlist) {
    return reply.code(404).send({ message: 'Playlist not found' })
  }
  const songs = [...playlist.songs]
  const [moved] = songs.splice(body.fromIndex, 1)
  songs.splice(body.toIndex, 0, moved)
  db.savePlaylist({
    ...playlist,
    songs,
    updatedAt: new Date().toISOString(),
  })
  return refreshPlaylists()
})

app.post('/api/import', async (request) => {
  const parts = request.parts()
  const uploadedFiles = new Map<string, { fileName: string; mimeType: string; buffer: Buffer }>()
  let draftPayload: Array<{
    id: string
    title: string
    artist: string
    album: string
    genre: string
    year: number
    duration: number
    themeColor: string
    files: Partial<Record<SongAssetKind, { id: string; fileName: string; kind: SongAssetKind }>>
  }> = []

  for await (const part of parts) {
    if (part.type === 'field' && part.fieldname === 'drafts') {
      draftPayload = JSON.parse(String(part.value))
      continue
    }

    if (part.type === 'file') {
      const chunks: Buffer[] = []
      for await (const chunk of part.file) {
        chunks.push(chunk)
      }
      uploadedFiles.set(part.fieldname, {
        fileName: part.filename,
        mimeType: part.mimetype,
        buffer: Buffer.concat(chunks),
      })
    }
  }

  const createdSongs: Song[] = []

  for (const draft of draftPayload) {
    const songId = `song-${randomUUID()}`
    const songDir = path.join(uploadsRoot, songId)
    fs.mkdirSync(songDir, { recursive: true })

    const assetDescriptors: Partial<Record<SongAssetKind, SongAsset & { url: string; text?: string }>> = {}

    for (const [kind, fileRef] of Object.entries(draft.files) as Array<
      [SongAssetKind, { id: string; fileName: string; kind: SongAssetKind } | undefined]
    >) {
      if (!fileRef) continue
      const upload = uploadedFiles.get(fileRef.id)
      if (!upload) continue

      const targetFileName = `${kind}-${upload.fileName}`
      fs.writeFileSync(path.join(songDir, targetFileName), upload.buffer)
      assetDescriptors[kind] = {
        id: `asset-${randomUUID()}`,
        kind,
        fileName: upload.fileName,
        mimeType: upload.mimeType,
        size: upload.buffer.byteLength,
        source: 'imported',
        url: createUploadAssetUrl(songId, targetFileName),
        text: kind === 'lyrics' ? upload.buffer.toString('utf-8') : undefined,
      }
    }

    createdSongs.push({
      ...createUploadedSong({
        metadata: {
          title: draft.title,
          artist: draft.artist,
          album: draft.album,
          genre: draft.genre,
          year: draft.year,
          duration: draft.duration,
          themeColor: draft.themeColor,
        },
        assetDescriptors,
      }),
      id: songId,
      audio: assetDescriptors.audio?.url ?? '',
      cover: assetDescriptors.cover?.url ?? `gradient://${draft.themeColor.replace('#', '')}/08142d`,
      backgroundVideo:
        assetDescriptors.background?.mimeType.startsWith('video/') ? assetDescriptors.background.url : '',
      backgroundImage:
        assetDescriptors.background && !assetDescriptors.background.mimeType.startsWith('video/')
          ? assetDescriptors.background.url
          : '',
    })
  }

  db.saveSongs(createdSongs)
  return refreshSongs()
})

app.get('/ws/player', { websocket: true }, (socket) => {
  const sender = {
    send: (payload: string) => socket.send(payload),
  }
  broadcastSockets.add(sender)

  socket.send(
    JSON.stringify({
      type: 'bootstrap',
      songs: db.listSongs(),
      playlists: db.listPlaylists(),
      playerState: playerState.getState(),
    } satisfies SocketOutboundMessage),
  )

  socket.on('message', (rawPayload: unknown) => {
    try {
      const parsed = JSON.parse(String(rawPayload)) as PlayerCommandMessage
      playerState.handle(parsed)
    } catch {
      socket.send(JSON.stringify({ type: 'player_state', playerState: playerState.getState() }))
    }
  })

  socket.on('close', () => {
    broadcastSockets.delete(sender)
  })
})

app.listen({ port, host })
