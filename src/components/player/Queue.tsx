import { motion } from 'framer-motion'
import { usePlayerStore } from '@/stores/playerStore'
import { formatTime } from '@/utils/time'
import { useShallow } from 'zustand/react/shallow'

export const Queue = () => {
  const { activeIndex, playSongById, tracks } = usePlayerStore(
    useShallow((state) => ({
      activeIndex: state.activeIndex,
      playSongById: state.playSongById,
      tracks: state.tracks,
    })),
  )

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-white/35 sm:text-xs sm:tracking-[0.3em]">
        <span>Queue</span>
        <span>{tracks.length} songs</span>
      </div>
      <div className="space-y-2">
        {tracks.slice(0, 5).map((song, index) => {
          const isActive = index === activeIndex

          return (
            <motion.button
              key={song.id}
              whileHover={{ x: 3 }}
              className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors ${
                isActive
                  ? 'border-accent-300/30 bg-accent-400/12 text-white'
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
