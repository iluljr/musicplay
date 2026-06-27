import { motion } from 'framer-motion'
import { usePlayerStore } from '@/stores/playerStore'
import { getSongPalette } from '@/utils/song'
import { useShallow } from 'zustand/react/shallow'

const visualizerBars = [0.5, 0.7, 0.35, 0.9, 0.45, 0.62, 0.38, 0.78]

export const Visualizer = () => {
  const { playbackStatus, song } = usePlayerStore(
    useShallow((state) => ({
      playbackStatus: state.playbackStatus,
      song: state.tracks[state.activeIndex],
    })),
  )

  if (!song) {
    return null
  }

  const [primary] = getSongPalette(song)
  const isAnimating = playbackStatus === 'playing' || playbackStatus === 'loading'

  return (
    <div className="flex h-16 items-end gap-2 rounded-[1.5rem] border border-white/8 bg-white/[0.03] px-4 py-3">
      {visualizerBars.map((bar, index) => (
        <motion.span
          key={index}
          animate={{
            height: isAnimating ? [`${28 * bar}%`, `${100 * bar}%`, `${40 * bar}%`] : '20%',
            opacity: isAnimating ? 0.9 : 0.35,
          }}
          transition={{
            duration: 1.6 + index * 0.08,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
          }}
          className="block w-full rounded-full"
          style={{
            background: `linear-gradient(180deg, ${primary}, rgba(255,255,255,0.2))`,
          }}
        />
      ))}
    </div>
  )
}
