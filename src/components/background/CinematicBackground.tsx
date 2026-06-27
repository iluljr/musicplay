import { motion } from 'framer-motion'

const orbs = [
  'from-[#4d82ff]/40 via-[#4d82ff]/5 to-transparent',
  'from-[#ff7a59]/30 via-[#ff7a59]/5 to-transparent',
  'from-[#67e8f9]/30 via-[#67e8f9]/5 to-transparent',
]

export const CinematicBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute inset-0 bg-noise opacity-90" />
    {orbs.map((gradient, index) => (
      <motion.div
        key={gradient}
        animate={{
          x: [0, index % 2 === 0 ? 60 : -70, 0],
          y: [0, index === 1 ? -50 : 40, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 14 + index * 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
        className={`absolute h-[28rem] w-[28rem] rounded-full bg-gradient-to-br ${gradient} blur-3xl`}
        style={{
          top: `${12 + index * 22}%`,
          left: `${index * 28}%`,
        }}
      />
    ))}
    <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-base-950 via-base-950/60 to-transparent" />
  </div>
)
