import { motion } from 'framer-motion'
import type { Track } from '@/types/player'

type TrackDetailsProps = {
  track: Track
}

export const TrackDetails = ({ track }: TrackDetailsProps) => (
  <motion.div layout className="space-y-3">
    <p className="text-sm uppercase tracking-[0.35em] text-accent-200/70">
      OBS Browser Source
    </p>
    <div>
      <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
        {track.title}
      </h1>
      <p className="mt-3 text-lg text-white/55 md:text-xl">{track.artist}</p>
    </div>
    <p className="max-w-xl text-sm leading-7 text-white/42 md:text-base">
      A cinematic now-playing scene built for livestream overlays, with smooth
      motion, glass surfaces, and a layout ready for lyrics and future OBS sync.
    </p>
  </motion.div>
)
