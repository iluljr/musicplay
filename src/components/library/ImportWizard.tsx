import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, FolderOpen, LoaderCircle, Music2, UploadCloud } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { GlassPanel } from '@/components/common/GlassPanel'
import { AssetBadges } from '@/components/library/AssetBadges'
import { scanImportFiles } from '@/services/mediaImport'
import type { ImportSongDraft } from '@/types/media'
import type { Song } from '@/types/song'
import { formatTime } from '@/utils/time'

type ImportWizardProps = {
  isOpen: boolean
  isSubmitting: boolean
  onClose: () => void
  onConfirm: (drafts: ImportSongDraft[]) => Promise<unknown>
}

type WizardStep = 1 | 2 | 3 | 4

type DirectoryInputElement = HTMLInputElement & {
  webkitdirectory?: boolean
}

const createPreviewSong = (draft: ImportSongDraft): Song => ({
  id: draft.id,
  title: draft.title,
  artist: draft.artist,
  album: draft.album,
  genre: draft.genre,
  year: draft.year,
  duration: draft.duration,
  cover: `gradient://${draft.themeColor.replace('#', '')}/08142d`,
  audio: '',
  lyrics: '',
  backgroundVideo: '',
  backgroundImage: '',
  themeColor: draft.themeColor,
  favorite: false,
  playCount: 0,
  lastPlayed: null,
  createdAt: '',
  updatedAt: '',
  assets: {
    audio: draft.files.audio
      ? {
          id: draft.files.audio.id,
          kind: 'audio',
          fileName: draft.files.audio.fileName,
          mimeType: draft.files.audio.file.type,
          size: draft.files.audio.file.size,
          source: 'imported',
        }
      : null,
    cover: draft.files.cover
      ? {
          id: draft.files.cover.id,
          kind: 'cover',
          fileName: draft.files.cover.fileName,
          mimeType: draft.files.cover.file.type,
          size: draft.files.cover.file.size,
          source: 'imported',
        }
      : null,
    lyrics: draft.files.lyrics
      ? {
          id: draft.files.lyrics.id,
          kind: 'lyrics',
          fileName: draft.files.lyrics.fileName,
          mimeType: draft.files.lyrics.file.type,
          size: draft.files.lyrics.file.size,
          source: 'imported',
        }
      : null,
    background: draft.files.background
      ? {
          id: draft.files.background.id,
          kind: 'background',
          fileName: draft.files.background.fileName,
          mimeType: draft.files.background.file.type,
          size: draft.files.background.file.size,
          source: 'imported',
        }
      : null,
  },
})

const readFilesFromDirectoryHandle = async (directoryHandle: FileSystemDirectoryHandle) => {
  const files: File[] = []

  for await (const entry of (
    directoryHandle as FileSystemDirectoryHandle & {
      values: () => AsyncIterable<FileSystemHandle>
    }
  ).values()) {
    if (entry.kind === 'file') {
      files.push(await (entry as FileSystemFileHandle).getFile())
    }
  }

  return files
}

export const ImportWizard = ({
  isOpen,
  isSubmitting,
  onClose,
  onConfirm,
}: ImportWizardProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const folderInputRef = useRef<DirectoryInputElement | null>(null)
  const [step, setStep] = useState<WizardStep>(1)
  const [drafts, setDrafts] = useState<ImportSongDraft[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!folderInputRef.current) {
      return
    }

    folderInputRef.current.setAttribute('webkitdirectory', '')
    folderInputRef.current.setAttribute('directory', '')
  }, [])

  const totalFiles = useMemo(
    () =>
      drafts.reduce(
        (total, draft) => total + Object.values(draft.files).filter(Boolean).length,
        0,
      ),
    [drafts],
  )

  const resetWizard = () => {
    setDrafts([])
    setStep(1)
    setIsScanning(false)
    setSubmitError(null)
  }

  const closeWizard = () => {
    resetWizard()
    onClose()
  }

  const startScan = async (files: File[]) => {
    if (files.length === 0) {
      return
    }

    setStep(2)
    setIsScanning(true)

    const nextDrafts = await scanImportFiles(files)

    setDrafts(nextDrafts)
    setIsScanning(false)
    setStep(3)
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-base-950/72 p-4 backdrop-blur-md"
        >
          <GlassPanel className="max-h-[90vh] w-full max-w-5xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-white/35">Import Music</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Media Library Wizard</h2>
              </div>
              <button
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/65"
                onClick={closeWizard}
                type="button"
              >
                Close
              </button>
            </div>

            <div className="border-b border-white/10 px-5 py-4">
              <div className="flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.24em] text-white/35">
                {[1, 2, 3, 4].map((value) => (
                  <span
                    key={value}
                    className={`rounded-full border px-3 py-1 ${
                      value === step
                        ? 'border-accent-300/30 bg-accent-400/12 text-accent-100'
                        : 'border-white/10 bg-white/[0.03]'
                    }`}
                  >
                    Step {value}
                  </span>
                ))}
              </div>
            </div>

            <div className="max-h-[65vh] overflow-y-auto p-5">
              {step === 1 ? (
                <div className="space-y-5">
                  <motion.button
                    whileHover={{ y: -2 }}
                    className="flex min-h-[260px] w-full flex-col items-center justify-center gap-4 rounded-[2rem] border border-dashed border-white/15 bg-white/[0.03] p-8 text-center"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault()
                      void startScan(Array.from(event.dataTransfer.files))
                    }}
                    type="button"
                  >
                    <UploadCloud className="h-10 w-10 text-white/60" />
                    <div className="space-y-2">
                      <p className="text-xl font-medium text-white">
                        Drag & drop music assets here
                      </p>
                      <p className="max-w-xl text-sm text-white/40">
                        Supports MP3, WAV, FLAC, OGG, LRC, JPG, PNG, WEBP, MP4,
                        and WEBM. Matching filenames are grouped automatically.
                      </p>
                    </div>
                  </motion.button>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <button
                      className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-white/70"
                      onClick={() => fileInputRef.current?.click()}
                      type="button"
                    >
                      Choose Files
                    </button>
                    <button
                      className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-white/70"
                      onClick={() => folderInputRef.current?.click()}
                      type="button"
                    >
                      Folder Picker Fallback
                    </button>
                    <button
                      className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-white/70"
                      onClick={async () => {
                        if ('showDirectoryPicker' in window) {
                          const directoryHandle = await (
                            window as Window & {
                              showDirectoryPicker: () => Promise<FileSystemDirectoryHandle>
                            }
                          ).showDirectoryPicker()
                          const files = await readFilesFromDirectoryHandle(directoryHandle)
                          await startScan(files)
                        }
                      }}
                      type="button"
                    >
                      <span className="inline-flex items-center gap-2">
                        <FolderOpen className="h-4 w-4" />
                        Folder Picker
                      </span>
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    accept=".mp3,.wav,.flac,.ogg,.lrc,.jpg,.jpeg,.png,.webp,.mp4,.webm"
                    className="hidden"
                    multiple
                    onChange={(event) =>
                      void startScan(Array.from(event.target.files ?? []))
                    }
                    type="file"
                  />
                  <input
                    ref={folderInputRef}
                    accept=".mp3,.wav,.flac,.ogg,.lrc,.jpg,.jpeg,.png,.webp,.mp4,.webm"
                    className="hidden"
                    multiple
                    onChange={(event) =>
                      void startScan(Array.from(event.target.files ?? []))
                    }
                    type="file"
                  />
                </div>
              ) : null}

              {step === 2 ? (
                <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 text-center">
                  <LoaderCircle className="h-10 w-10 animate-spin text-accent-200" />
                  <div className="space-y-2">
                    <p className="text-xl font-medium text-white">Scanning assets</p>
                    <p className="text-sm text-white/40">
                      Reading files, extracting audio metadata, and grouping related assets.
                    </p>
                  </div>
                  {isScanning ? (
                    <p className="text-xs uppercase tracking-[0.24em] text-white/30">
                      Step 2 · Scanning
                    </p>
                  ) : null}
                </div>
              ) : null}

              {step === 3 ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-white/45">
                        {drafts.length} songs detected from {totalFiles} files
                      </p>
                    </div>
                    <button
                      className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/65"
                      onClick={() => setStep(4)}
                      type="button"
                    >
                      Continue
                    </button>
                  </div>

                  <div className="space-y-3">
                    {drafts.map((draft) => {
                      const previewSong = createPreviewSong(draft)

                      return (
                        <div
                          key={draft.id}
                          className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <div
                                  className="h-14 w-14 rounded-2xl border border-white/10"
                                  style={{
                                    background: `linear-gradient(135deg, ${draft.themeColor}, #08142d)`,
                                  }}
                                />
                                <div>
                                  <p className="text-lg font-medium text-white">{draft.title}</p>
                                  <p className="text-sm text-white/45">
                                    {formatTime(draft.duration)} · {draft.genre}
                                  </p>
                                </div>
                              </div>
                              <AssetBadges song={previewSong} />
                            </div>
                            <div className="flex items-center gap-2 text-sm text-white/35">
                              <Music2 className="h-4 w-4" />
                              {Object.values(draft.files).filter(Boolean).length} assets
                            </div>
                          </div>
                          {draft.warnings.length > 0 ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {draft.warnings.map((warning) => (
                                <span
                                  key={warning}
                                  className="rounded-full border border-amber-400/25 bg-amber-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-amber-100"
                                >
                                  {warning}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : null}

              {step === 4 ? (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-white">Confirm import</p>
                    <p className="text-sm text-white/45">
                      The selected files will be stored in the local media library and
                      immediately available across the application UI.
                    </p>
                  </div>

                  <div className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-white/35">Songs</p>
                      <p className="mt-2 text-2xl font-semibold text-white">{drafts.length}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-white/35">Files</p>
                      <p className="mt-2 text-2xl font-semibold text-white">{totalFiles}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-white/35">
                        Complete Assets
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-white">
                        {
                          drafts.filter(
                            (draft) =>
                              draft.files.audio &&
                              draft.files.cover &&
                              draft.files.lyrics &&
                              draft.files.background,
                          ).length
                        }
                      </p>
                    </div>
                  </div>

                  {submitError ? (
                    <div className="rounded-[1.25rem] border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                      {submitError}
                    </div>
                  ) : null}

                  <div className="flex flex-wrap justify-end gap-3">
                    <button
                      className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/65"
                      onClick={() => setStep(3)}
                      type="button"
                    >
                      Back
                    </button>
                    <button
                      className="rounded-full border border-accent-300/30 bg-accent-400/12 px-5 py-2 text-sm text-accent-100"
                      disabled={isSubmitting}
                      onClick={async () => {
                        setSubmitError(null)

                        try {
                          await onConfirm(drafts)
                          closeWizard()
                        } catch (error) {
                          setSubmitError(
                            error instanceof Error
                              ? error.message
                              : 'Import failed. Please try again.',
                          )
                        }
                      }}
                      type="button"
                    >
                      <span className="inline-flex items-center gap-2">
                        {isSubmitting ? (
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        Confirm Import
                      </span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </GlassPanel>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
