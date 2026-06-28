type AudioMetadata = {
  title?: string
  artist?: string
  album?: string
  genre?: string
  year?: number
}

const decodeIso88591 = (bytes: Uint8Array) =>
  Array.from(bytes, (value) => String.fromCharCode(value)).join('')

const decodeTextFrame = (bytes: Uint8Array) => {
  if (bytes.length === 0) {
    return ''
  }

  const encoding = bytes[0]
  const payload = bytes.slice(1)

  if (encoding === 0x01 || encoding === 0x02) {
    const decoded = new TextDecoder('utf-16').decode(payload)
    return decoded.replace(/\u0000/g, '').trim()
  }

  if (encoding === 0x03) {
    return new TextDecoder('utf-8').decode(payload).replace(/\u0000/g, '').trim()
  }

  return decodeIso88591(payload).replace(/\u0000/g, '').trim()
}

const decodeGenre = (value: string) => value.replace(/^\((\d+)\)$/, '$1').trim()

const parseId3v2TagSize = (bytes: Uint8Array) =>
  ((bytes[0] & 0x7f) << 21) |
  ((bytes[1] & 0x7f) << 14) |
  ((bytes[2] & 0x7f) << 7) |
  (bytes[3] & 0x7f)

const parseId3v2Metadata = (bytes: Uint8Array): AudioMetadata => {
  if (
    bytes.length < 10 ||
    bytes[0] !== 0x49 ||
    bytes[1] !== 0x44 ||
    bytes[2] !== 0x33
  ) {
    return {}
  }

  const version = bytes[3]
  const tagSize = parseId3v2TagSize(bytes.slice(6, 10))
  const metadata: AudioMetadata = {}
  let offset = 10
  const maxOffset = Math.min(bytes.length, 10 + tagSize)

  while (offset + 10 <= maxOffset) {
    const frameId = decodeIso88591(bytes.slice(offset, offset + 4))

    if (!frameId.trim() || /^\x00+$/.test(frameId)) {
      break
    }

    const frameSize =
      version === 4
        ? parseId3v2TagSize(bytes.slice(offset + 4, offset + 8))
        : (bytes[offset + 4] << 24) |
          (bytes[offset + 5] << 16) |
          (bytes[offset + 6] << 8) |
          bytes[offset + 7]

    if (frameSize <= 0 || offset + 10 + frameSize > maxOffset) {
      break
    }

    const frameData = bytes.slice(offset + 10, offset + 10 + frameSize)
    const value = decodeTextFrame(frameData)

    switch (frameId) {
      case 'TIT2':
        metadata.title ||= value
        break
      case 'TPE1':
        metadata.artist ||= value
        break
      case 'TPE2':
        metadata.artist ||= value
        break
      case 'TALB':
        metadata.album ||= value
        break
      case 'TCON':
        metadata.genre ||= decodeGenre(value)
        break
      case 'TDRC':
      case 'TYER': {
        const year = Number.parseInt(value.slice(0, 4), 10)

        if (!Number.isNaN(year)) {
          metadata.year ||= year
        }
        break
      }
      default:
        break
    }

    offset += 10 + frameSize
  }

  return metadata
}

const parseId3v1Metadata = (bytes: Uint8Array): AudioMetadata => {
  if (bytes.length < 128) {
    return {}
  }

  const tagOffset = bytes.length - 128

  if (
    bytes[tagOffset] !== 0x54 ||
    bytes[tagOffset + 1] !== 0x41 ||
    bytes[tagOffset + 2] !== 0x47
  ) {
    return {}
  }

  const readField = (start: number, length: number) =>
    decodeIso88591(bytes.slice(start, start + length)).replace(/\u0000/g, '').trim()

  const yearValue = Number.parseInt(readField(tagOffset + 93, 4), 10)

  return {
    title: readField(tagOffset + 3, 30) || undefined,
    artist: readField(tagOffset + 33, 30) || undefined,
    album: readField(tagOffset + 63, 30) || undefined,
    year: Number.isNaN(yearValue) ? undefined : yearValue,
  }
}

export const getAudioMetadataFromFile = async (file: File): Promise<AudioMetadata> => {
  try {
    const buffer = await file.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    const id3v2Metadata = parseId3v2Metadata(bytes)
    const id3v1Metadata = parseId3v1Metadata(bytes)

    return {
      title: id3v2Metadata.title || id3v1Metadata.title,
      artist: id3v2Metadata.artist || id3v1Metadata.artist,
      album: id3v2Metadata.album || id3v1Metadata.album,
      genre: id3v2Metadata.genre || id3v1Metadata.genre,
      year: id3v2Metadata.year || id3v1Metadata.year,
    }
  } catch {
    return {}
  }
}

export const getAudioDurationFromFile = async (file: File) => {
  const objectUrl = URL.createObjectURL(file)

  try {
    const duration = await new Promise<number>((resolve) => {
      const audio = new Audio()

      audio.preload = 'metadata'
      audio.onloadedmetadata = () => resolve(Number.isFinite(audio.duration) ? audio.duration : 0)
      audio.onerror = () => resolve(0)
      audio.src = objectUrl
    })

    return duration
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
