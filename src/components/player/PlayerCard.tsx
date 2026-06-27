import { AnimatePresence, motion } from 'framer-motion'
import { AlbumCover } from '@/components/player/AlbumCover'
import { PlaybackControls } from '@/components/player/PlaybackControls'
import { ProgressBar } from '@/components/player/ProgressBar'
import { TrackDetails } from '@/components/player/TrackDetails'
import { usePlayerStore } from '@/stores/playerStore'

export const PlayerCard = () => {
  const tracks = usePlayerStore((state) => state.tracks)
  const activeIndex = usePlayerStore((state) => state.activeIndex)
  const activeTrack = tracks[activeIndex]

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative mx-auto grid w-full max-w-6xl gap-8 overflow-hidden rounded-[2.25rem] border border-white/10 bg-white/8 p-5 shadow-glow backdrop-blur-2xl md:grid-cols-[340px_minmax(0,1fr)] md:p-8"
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.14),transparent_45%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(circle_at_bottom,rgba(124,161,255,0.18),transparent_55%)]" />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTrack.id}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.45 }}
          className="relative z-10"
        >
          <AlbumCover track={activeTrack} />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex min-h-full flex-col justify-between gap-8 rounded-[1.75rem] border border-white/8 bg-base-950/45 p-6 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeTrack.id}-content`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="space-y-8"
          >
            <TrackDetails track={activeTrack} />
            <ProgressBar track={activeTrack} />
          </motion.div>
        </AnimatePresence>

        <PlaybackControls />
      </div>
    </motion.section>
  )
}
