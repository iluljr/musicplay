import { motion } from 'framer-motion'
import type { Track } from '@/types/player'

type AlbumCoverProps = {
  track: Track
}

export const AlbumCover = ({ track }: AlbumCoverProps) => (
  <motion.div
    layout
    className="relative aspect-square w-full overflow-hidden rounded-[2rem] border border-white/12 bg-white/10 shadow-glow"
  >
    <div
      className="absolute inset-0"
      style={{
        background: `linear-gradient(135deg, ${track.coverGradient[0]}, ${track.coverGradient[1]})`,
      }}
    />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.28),transparent_34%)]" />
    <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,rgba(2,6,23,0.72)_100%)]" />
    <div className="absolute bottom-5 left-5 right-5">
      <div className="mb-3 h-1 w-16 rounded-full bg-white/70" />
      <p className="text-sm uppercase tracking-[0.35em] text-white/65">Now Playing</p>
      <h2 className="mt-2 text-3xl font-semibold text-white">{track.title}</h2>
    </div>
  </motion.div>
)
