import { motion } from 'framer-motion'
import type { Song } from '@/types/song'
import { getSongPalette } from '@/utils/song'

type AlbumCoverProps = {
  track: Song
}

export const AlbumCover = ({ track }: AlbumCoverProps) => {
  const [primary, secondary] = getSongPalette(track)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -32, scale: 0.92, rotate: -3 }}
      animate={{ opacity: 1, x: 0, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, x: 26, scale: 1.02 }}
      transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
      className="relative aspect-square w-full overflow-hidden rounded-[2rem] border border-white/12 bg-white/10 shadow-glow"
    >
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${primary}, ${secondary})`,
        }}
      />
      <motion.div
        className="absolute inset-0"
        animate={{
          opacity: [0.24, 0.36, 0.24],
        }}
        transition={{
          duration: 7,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
        style={{
          background: `radial-gradient(circle at 35% 28%, ${primary}88, transparent 38%)`,
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.28),transparent_34%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,rgba(2,6,23,0.72)_100%)]" />
      <div className="absolute inset-0 rounded-[2rem] ring-1 ring-white/10 ring-inset" />
      <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-5">
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 64, opacity: 1 }}
          transition={{ duration: 0.55, delay: 0.16, ease: 'easeOut' }}
          className="mb-3 h-1 rounded-full bg-white/70 shadow-[0_0_24px_rgba(255,255,255,0.38)]"
        />
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.18 }}
          className="text-[11px] uppercase tracking-[0.3em] text-white/65 sm:text-sm sm:tracking-[0.35em]"
        >
          Now Playing
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="mt-2 text-2xl font-semibold leading-tight text-white sm:text-3xl"
        >
          {track.title}
        </motion.h2>
      </div>
    </motion.div>
  )
}
