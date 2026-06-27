import { AnimatePresence, motion } from 'framer-motion'
import { AlbumCover } from '@/components/player/AlbumCover'
import { LyricsPanel } from '@/components/lyrics/LyricsPanel'
import { PlaybackControls } from '@/components/player/PlaybackControls'
import { ProgressBar } from '@/components/player/ProgressBar'
import { Queue } from '@/components/player/Queue'
import { SongInfo } from '@/components/player/SongInfo'
import { Visualizer } from '@/components/player/Visualizer'
import { useDisplayMode } from '@/hooks/useDisplayMode'
import { usePlayerStore } from '@/stores/playerStore'
import { getSongPalette } from '@/utils/song'
import { useShallow } from 'zustand/react/shallow'

export const PlayerCard = () => {
  const displayMode = useDisplayMode()
  const { tracks, activeIndex } = usePlayerStore(
    useShallow((state) => ({
      tracks: state.tracks,
      activeIndex: state.activeIndex,
    })),
  )
  const activeTrack = tracks[activeIndex]

  if (!activeTrack) {
    return null
  }

  const [primary, secondary] = getSongPalette(activeTrack)

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`relative mx-auto grid w-full max-w-6xl gap-5 overflow-hidden rounded-[1.75rem] border border-white/10 p-3 shadow-glow backdrop-blur-2xl sm:gap-6 sm:rounded-[2rem] sm:p-4 ${
        displayMode.transparentBackground ? 'bg-white/[0.05]' : 'bg-white/8'
      } ${
        displayMode.showCover
          ? 'md:grid-cols-[340px_minmax(0,1fr)]'
          : 'md:grid-cols-[minmax(0,1fr)]'
      } ${displayMode.compactLayout ? 'md:p-6' : 'md:p-8'}`}
    >
      <motion.div
        key={`${activeTrack.id}-panel-glow`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.1, ease: 'easeOut' }}
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 18% 24%, ${primary}18, transparent 28%), radial-gradient(circle at 82% 70%, ${secondary}12, transparent 34%)`,
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.14),transparent_45%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(circle_at_bottom,rgba(124,161,255,0.18),transparent_55%)]" />

      {displayMode.showCover ? (
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
      ) : null}

      <div className="relative z-10 flex min-h-full min-w-0 flex-col justify-between gap-6 rounded-[1.35rem] border border-white/8 bg-base-950/45 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_24px_80px_rgba(2,6,23,0.32)] sm:gap-8 sm:rounded-[1.75rem] sm:p-6 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeTrack.id}-content`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6 sm:space-y-8"
          >
            <SongInfo song={activeTrack} />
            {displayMode.showProgress ? <ProgressBar /> : null}
            <Visualizer />
            {displayMode.showLyrics ? <LyricsPanel /> : null}
            {displayMode.showPlaylist ? <Queue /> : null}
          </motion.div>
        </AnimatePresence>

        {displayMode.showControls ? <PlaybackControls /> : null}
      </div>
    </motion.section>
  )
}
