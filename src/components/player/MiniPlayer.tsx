import { Pause, Play } from 'lucide-react'
import { motion } from 'framer-motion'
import { usePlayerStore } from '@/stores/playerStore'
import { getSongPalette } from '@/utils/song'
import { useShallow } from 'zustand/react/shallow'

export const MiniPlayer = () => {
  const { song, playbackStatus, togglePlay } = usePlayerStore(
    useShallow((state) => ({
      song: state.tracks[state.activeIndex],
      playbackStatus: state.playbackStatus,
      togglePlay: state.togglePlay,
    })),
  )

  if (!song) {
    return null
  }

  const [primary, secondary] = getSongPalette(song)
  const isPlaying = playbackStatus === 'playing' || playbackStatus === 'loading'

  return (
    <div className="flex items-center gap-3">
      <div
        className="h-12 w-12 shrink-0 rounded-2xl border border-white/10"
        style={{
          background: `linear-gradient(135deg, ${primary}, ${secondary})`,
        }}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">{song.title}</p>
        <p className="truncate text-xs uppercase tracking-[0.24em] text-white/40">
          {song.artist}
        </p>
      </div>
      <motion.button
        whileTap={{ scale: 0.96 }}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/8 text-white/80"
        onClick={togglePlay}
        type="button"
      >
        {isPlaying ? (
          <Pause className="h-4 w-4 fill-current" />
        ) : (
          <Play className="ml-0.5 h-4 w-4 fill-current" />
        )}
      </motion.button>
    </div>
  )
}
