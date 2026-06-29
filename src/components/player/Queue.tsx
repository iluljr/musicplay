import { motion } from 'framer-motion'
import { usePlayerStore } from '@/stores/playerStore'
import { formatTime } from '@/utils/time'
import { useShallow } from 'zustand/react/shallow'

const MAX_VISIBLE_QUEUE_ITEMS = 2

export const Queue = () => {
  const { activeIndex, playSongById, queueSongIds, tracks } = usePlayerStore(
    useShallow((state) => ({
      activeIndex: state.activeIndex,
      playSongById: state.playSongById,
      queueSongIds: state.queueSongIds,
      tracks: state.tracks,
    })),
  )

  const activeSongId = tracks[activeIndex]?.id ?? null
  const effectiveQueueSongIds =
    queueSongIds.length > 0 ? queueSongIds : tracks.map((track) => track.id)
  const activeQueueIndex = activeSongId
    ? effectiveQueueSongIds.indexOf(activeSongId)
    : -1
  const visibleQueue = effectiveQueueSongIds.length === 0
    ? []
    : Array.from(
        { length: Math.min(MAX_VISIBLE_QUEUE_ITEMS, effectiveQueueSongIds.length) },
        (_, offset) => {
          const queueIndex =
            ((activeQueueIndex >= 0 ? activeQueueIndex : 0) + offset) %
            effectiveQueueSongIds.length
          const songId = effectiveQueueSongIds[queueIndex]
          const song = tracks.find((track) => track.id === songId)

          if (!song) {
            return null
          }

        return {
            song,
          }
        },
      ).filter((entry): entry is { song: (typeof tracks)[number] } => entry !== null)

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-white/35 sm:text-xs sm:tracking-[0.3em]">
        <span>Queue</span>
        <span>{tracks.length} songs</span>
      </div>
      <div className="space-y-2">
        {visibleQueue.map(({ song }, index) => {
          const isActive = index === 0

          return (
            <motion.button
              key={song.id}
              whileHover={{ x: 3 }}
              className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors ${
                isActive
                  ? 'border-accent-300/35 bg-accent-400/18 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_10px_30px_rgba(96,165,250,0.08)]'
                  : 'border-white/8 bg-white/[0.03] text-white/55'
              }`}
              onClick={() => playSongById(song.id)}
              type="button"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{song.title}</p>
                <p className="truncate text-xs uppercase tracking-[0.25em] text-white/35">
                  {song.artist}
                </p>
              </div>
              <span className="text-xs text-white/35">{formatTime(song.duration)}</span>
            </motion.button>
          )
        })}
      </div>
    </section>
  )
}
