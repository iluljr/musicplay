import { motion } from 'framer-motion'
import type { Track } from '@/types/player'
import { formatTime } from '@/utils/time'

type ProgressBarProps = {
  track: Track
}

export const ProgressBar = ({ track }: ProgressBarProps) => {
  const progressPercentage = (track.progress / track.duration) * 100

  return (
    <div className="space-y-3">
      <div className="h-2 overflow-hidden rounded-full bg-white/8">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-accent-200 via-accent-300 to-cyan-300 shadow-[0_0_24px_rgba(124,161,255,0.55)]"
        />
      </div>
      <div className="flex items-center justify-between text-sm text-white/45">
        <span>{formatTime(track.progress)}</span>
        <span>{formatTime(track.duration)}</span>
      </div>
    </div>
  )
}
