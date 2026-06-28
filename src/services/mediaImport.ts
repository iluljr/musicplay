import type { ImportScannedFile, ImportSongDraft, ImportableAssetKind } from '@/types/media'
import {
  formatBaseNameAsTitle,
  inferAssetKind,
  inferThemeColorFromName,
  normalizeSongBaseName,
} from '@/utils/media'
import { getAudioDurationFromFile, getAudioMetadataFromFile } from '@/utils/mediaMetadata'

const assetOrder: ImportableAssetKind[] = ['audio', 'cover', 'lyrics', 'background']

const createDraft = (baseName: string): ImportSongDraft => ({
  id: `import-${crypto.randomUUID()}`,
  baseName,
  title: formatBaseNameAsTitle(baseName),
  artist: 'Unknown Artist',
  album: 'Imported Media',
  genre: 'Unsorted',
  year: new Date().getFullYear(),
  duration: 0,
  themeColor: inferThemeColorFromName(baseName),
  files: {},
  warnings: [],
})

export const scanImportFiles = async (files: File[]) => {
  const supportedFiles = files
    .map((file) => {
      const kind = inferAssetKind(file.name)

      if (!kind) {
        return null
      }

      return {
        id: `file-${crypto.randomUUID()}`,
        baseName: normalizeSongBaseName(file.name),
        file,
        fileName: file.name,
        kind,
      } satisfies ImportScannedFile
    })
    .filter((file): file is ImportScannedFile => Boolean(file))

  const groups = new Map<string, ImportSongDraft>()

  for (const scannedFile of supportedFiles) {
    const draft = groups.get(scannedFile.baseName) ?? createDraft(scannedFile.baseName)
    const existing = draft.files[scannedFile.kind]

    if (existing) {
      draft.warnings.push(`Multiple ${scannedFile.kind} assets found`)
    } else {
      draft.files[scannedFile.kind] = scannedFile
    }

    groups.set(scannedFile.baseName, draft)
  }

  const drafts = Array.from(groups.values())

  await Promise.all(
    drafts.map(async (draft) => {
      if (draft.files.audio) {
        const [duration, metadata] = await Promise.all([
          getAudioDurationFromFile(draft.files.audio.file),
          getAudioMetadataFromFile(draft.files.audio.file),
        ])

        draft.duration = duration
        draft.title = metadata.title || draft.title
        draft.artist = metadata.artist || draft.artist
        draft.album = metadata.album || draft.album
        draft.genre = metadata.genre || draft.genre
        draft.year = metadata.year || draft.year
      }
    }),
  )

  return drafts.sort((left, right) => {
    const leftCount = assetOrder.filter((kind) => left.files[kind]).length
    const rightCount = assetOrder.filter((kind) => right.files[kind]).length

    return rightCount - leftCount || left.title.localeCompare(right.title)
  })
}
