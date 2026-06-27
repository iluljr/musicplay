import { motion } from 'framer-motion'
import { RangeInput } from '@/components/common/RangeInput'
import { usePlayerStore } from '@/stores/playerStore'
import { formatTime } from '@/utils/time'
import { useShallow } from 'zustand/react/shallow'

export const ProgressBar = () => {
  const { currentTime, duration, seek } = usePlayerStore(
    useShallow((state) => ({
      currentTime: state.currentTime,
      duration: state.duration,
      seek: state.seek,
    })),
  )
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="space-y-3">
      <div className="relative">
        <RangeInput
          aria-label="Seek track position"
          className="relative z-10 h-5 bg-transparent [&::-webkit-slider-runnable-track]:bg-transparent"
          max={duration || 0}
          min={0}
          onChange={(event) => seek(Number(event.target.value))}
          step={0.01}
          value={duration ? currentTime : 0}
        />
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 overflow-hidden rounded-full bg-white/8">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.12, ease: 'linear' }}
            className="h-full rounded-full bg-gradient-to-r from-accent-200 via-accent-300 to-cyan-300 shadow-[0_0_24px_rgba(124,161,255,0.55)]"
          />
        </div>
      </div>
      <div className="flex items-center justify-between text-sm text-white/45">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  )
}
