import type { LrcMetadata, LyricLine, LyricWord, ParsedLrc } from '@/types/lyrics'

const METADATA_KEYS: Record<string, keyof LrcMetadata> = {
  ar: 'artist',
  ti: 'title',
  al: 'album',
}

const timestampPattern = /\[(\d{1,2}:\d{2}(?:\.\d{1,3})?)\]/g
const metadataPattern = /^\[([a-zA-Z]{2,}):(.*)\]$/

const createWords = (text: string): LyricWord[] => {
  const matches = [...text.matchAll(/\S+/g)]

  return matches.map((match, index) => ({
    id: `${index}-${match.index ?? 0}`,
    text: match[0],
    startTime: null,
    endTime: null,
    charRange: [
      match.index ?? 0,
      (match.index ?? 0) + match[0].length,
    ],
  }))
}

const parseTimestamp = (timestamp: string) => {
  const [minutesPart, secondsPart] = timestamp.split(':')
  const minutes = Number(minutesPart)
  const seconds = Number(secondsPart)

  if (Number.isNaN(minutes) || Number.isNaN(seconds)) {
    return null
  }

  return minutes * 60 + seconds
}

export const parseLrc = (input: string): ParsedLrc => {
  const metadata: LrcMetadata = {}
  const lines: LyricLine[] = []

  for (const rawLine of input.split(/\r?\n/)) {
    const line = rawLine.trimEnd()

    if (!line.trim()) {
      continue
    }

    const metadataMatch = line.match(metadataPattern)

    if (metadataMatch && !line.match(timestampPattern)) {
      const [, key, rawValue] = metadataMatch
      const normalizedKey = METADATA_KEYS[key.toLowerCase()]

      if (normalizedKey) {
        metadata[normalizedKey] = rawValue.trim()
      }

      continue
    }

    const timestamps = [...line.matchAll(timestampPattern)]

    if (timestamps.length === 0) {
      continue
    }

    const text = line.replace(timestampPattern, '').trim()

    timestamps.forEach((match, index) => {
      const time = parseTimestamp(match[1])

      if (time === null) {
        return
      }

      lines.push({
        id: `${time}-${index}-${text}`,
        time,
        text,
        words: createWords(text),
        rawText: text,
      })
    })
  }

  lines.sort((left, right) => left.time - right.time)

  return {
    metadata,
    lines,
  }
}

export const findActiveLyricLineIndex = (
  lines: LyricLine[],
  currentTime: number,
) => {
  if (lines.length === 0 || currentTime < lines[0].time) {
    return -1
  }

  let low = 0
  let high = lines.length - 1
  let result = -1

  while (low <= high) {
    const middle = Math.floor((low + high) / 2)

    if (lines[middle].time <= currentTime) {
      result = middle
      low = middle + 1
    } else {
      high = middle - 1
    }
  }

  return result
}
