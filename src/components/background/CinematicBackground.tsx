import { AnimatePresence, motion } from 'framer-motion'
import type { Song } from '@/types/song'
import { getSongBackground, getSongPalette } from '@/utils/song'

const orbs = [
  'from-[#4d82ff]/40 via-[#4d82ff]/5 to-transparent',
  'from-[#ff7a59]/30 via-[#ff7a59]/5 to-transparent',
  'from-[#67e8f9]/30 via-[#67e8f9]/5 to-transparent',
]

type CinematicBackgroundProps = {
  animated?: boolean
  transparent?: boolean
  track: Song | null
}

const fallbackPalette: [string, string] = ['#4d82ff', '#67e8f9']
const fallbackBackground: [string, string] = ['#050816', '#0b1020']

export const CinematicBackground = ({
  animated = true,
  transparent = false,
  track,
}: CinematicBackgroundProps) => {
  const [primary, secondary] = track ? getSongPalette(track) : fallbackPalette
  const [backgroundStart, backgroundEnd] = track
    ? getSongBackground(track)
    : fallbackBackground

  return (
    <div className="absolute inset-0 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={track?.id ?? 'empty-library'}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: transparent ? 0.55 : 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <div
            className="absolute inset-0"
            style={{
              background: transparent
                ? `radial-gradient(circle at 18% 18%, ${primary}44, transparent 34%), radial-gradient(circle at 80% 22%, ${secondary}3d, transparent 36%)`
                : `radial-gradient(circle at 18% 18%, ${primary}55, transparent 34%), radial-gradient(circle at 80% 22%, ${secondary}45, transparent 36%), linear-gradient(135deg, ${backgroundStart} 0%, ${backgroundEnd} 100%)`,
            }}
          />
          <div
            className="absolute inset-0 opacity-60"
            style={{
              background: `radial-gradient(circle at 50% 75%, ${primary}22, transparent 42%)`,
            }}
          />
        </motion.div>
      </AnimatePresence>
      <div
        className={`absolute inset-0 bg-noise ${transparent ? 'opacity-35' : 'opacity-90'}`}
      />
      {orbs.map((gradient, index) => (
        <motion.div
          key={gradient}
          animate={
            animated
              ? {
                  x: [0, index % 2 === 0 ? 60 : -70, 0],
                  y: [0, index === 1 ? -50 : 40, 0],
                  scale: [1, 1.1, 1],
                }
              : {
                  x: 0,
                  y: 0,
                  scale: 1,
                }
          }
          transition={
            animated
              ? {
                  duration: 14 + index * 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'easeInOut',
                }
              : { duration: 0 }
          }
          className={`absolute h-[28rem] w-[28rem] transform-gpu rounded-full bg-gradient-to-br ${gradient} blur-3xl will-change-transform`}
          style={{
            top: `${12 + index * 22}%`,
            left: `${index * 28}%`,
          }}
        />
      ))}
      <motion.div
        key={`${track?.id ?? 'empty-library'}-glow`}
        initial={{ opacity: 0 }}
        animate={{ opacity: transparent ? 0.28 : 0.42 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${primary}14, transparent 55%)`,
        }}
      />
      {transparent ? null : (
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-base-950 via-base-950/60 to-transparent" />
      )}
    </div>
  )
}
