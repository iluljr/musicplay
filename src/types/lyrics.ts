export type LrcMetadata = {
  artist?: string
  title?: string
  album?: string
}

export type LyricWord = {
  id: string
  text: string
  startTime: number | null
  endTime: number | null
  charRange: [number, number]
}

export type LyricLine = {
  id: string
  time: number
  text: string
  words: LyricWord[]
  rawText: string
}

export type ParsedLrc = {
  metadata: LrcMetadata
  lines: LyricLine[]
}
