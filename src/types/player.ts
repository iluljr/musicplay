export type Track = {
  id: string
  title: string
  artist: string
  album: string
  duration: number
  progress: number
  coverGradient: [string, string]
}

export type RepeatMode = 'off' | 'all' | 'one'
