import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { GlassPanel } from '@/components/common/GlassPanel'
import type { Song } from '@/types/song'

type MetadataEditorDialogProps = {
  isOpen: boolean
  song: Song | null
  onClose: () => void
  onSave: (songId: string, updates: Partial<Pick<Song, 'title' | 'artist' | 'album' | 'genre' | 'year' | 'favorite'>>) => Promise<unknown>
}

export const MetadataEditorDialog = ({
  isOpen,
  song,
  onClose,
  onSave,
}: MetadataEditorDialogProps) => {
  const [draft, setDraft] = useState({
    title: '',
    artist: '',
    album: '',
    genre: '',
    year: 2026,
    favorite: false,
  })

  useEffect(() => {
    if (!song) {
      return
    }

    setDraft({
      title: song.title,
      artist: song.artist,
      album: song.album,
      genre: song.genre,
      year: song.year,
      favorite: song.favorite,
    })
  }, [song])

  return (
    <AnimatePresence>
      {isOpen && song ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-base-950/72 p-4 backdrop-blur-md"
        >
          <GlassPanel className="w-full max-w-xl p-5">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.32em] text-white/35">Edit Metadata</p>
              <h2 className="text-2xl font-semibold text-white">{song.title}</h2>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {(
                [
                  ['title', 'Title'],
                  ['artist', 'Artist'],
                  ['album', 'Album'],
                  ['genre', 'Genre'],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="space-y-2">
                  <span className="text-sm text-white/55">{label}</span>
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none"
                    onChange={(event) =>
                      setDraft((state) => ({ ...state, [key]: event.target.value }))
                    }
                    value={draft[key]}
                  />
                </label>
              ))}

              <label className="space-y-2">
                <span className="text-sm text-white/55">Year</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none"
                  onChange={(event) =>
                    setDraft((state) => ({ ...state, year: Number(event.target.value) }))
                  }
                  type="number"
                  value={draft.year}
                />
              </label>

              <label className="flex items-center gap-3 pt-8 text-sm text-white/55">
                <input
                  checked={draft.favorite}
                  onChange={(event) =>
                    setDraft((state) => ({ ...state, favorite: event.target.checked }))
                  }
                  type="checkbox"
                />
                Favorite
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/65"
                onClick={onClose}
                type="button"
              >
                Cancel
              </button>
              <button
                className="rounded-full border border-accent-300/30 bg-accent-400/12 px-5 py-2 text-sm text-accent-100"
                onClick={async () => {
                  await onSave(song.id, draft)
                  onClose()
                }}
                type="button"
              >
                Save Metadata
              </button>
            </div>
          </GlassPanel>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
