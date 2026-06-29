export type SongAssetKind = 'audio' | 'cover' | 'lyrics' | 'background'

export type SongAsset = {
  id: string
  kind: SongAssetKind
  fileName: string
  mimeType: string
  size: number
  source: 'mock' | 'imported'
}

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
  assets: Record<SongAssetKind, SongAsset | null>
}

export type Playlist = {
  id: string
  name: string
  cover: string
  description: string
  songs: string[]
  createdAt: string
  updatedAt: string
}

export type RepeatMode = 'off' | 'all' | 'one'
export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'stopped' | 'ended' | 'error'

export type PlayerState = {
  activeSongId: string | null
  activeIndex: number
  queueSongIds: string[]
  playbackStatus: PlaybackStatus
  currentTime: number
  duration: number
  isShuffleEnabled: boolean
  repeatMode: RepeatMode
  volume: number
  playbackRate: number
  error: string | null
  updatedAt: string
}

export type PlayerCommandMessage =
  | { type: 'command'; command: 'play' | 'pause' | 'stop' | 'next' | 'previous' }
  | { type: 'command'; command: 'seek'; value: number }
  | { type: 'command'; command: 'volume'; value: number }
  | { type: 'command'; command: 'playbackRate'; value: number }
  | { type: 'command'; command: 'shuffle' }
  | { type: 'command'; command: 'repeat' }
  | { type: 'command'; command: 'playSongId'; songId: string }
  | {
      type: 'command'
      command: 'setQueue'
      songIds: string[]
      startSongId?: string
      shouldPlay?: boolean
    }
  | { type: 'telemetry'; currentTime: number; duration: number; playbackStatus: PlaybackStatus }

export type SocketOutboundMessage =
  | { type: 'bootstrap'; songs: Song[]; playlists: Playlist[]; playerState: PlayerState }
  | { type: 'songs_updated'; songs: Song[] }
  | { type: 'playlists_updated'; playlists: Playlist[] }
  | { type: 'player_state'; playerState: PlayerState }
