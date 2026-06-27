import { memo } from 'react'
import { motion } from 'framer-motion'
import type { LyricLine } from '@/types/lyrics'
import { cn } from '@/utils/cn'

type LyricLineItemProps = {
  line: LyricLine
  state: 'past' | 'active' | 'future'
  setRef?: (node: HTMLDivElement | null) => void
}

export const LyricLineItem = memo(
  ({ line, state, setRef }: LyricLineItemProps) => (
    <motion.div
      ref={setRef}
      animate={{
        opacity: state === 'active' ? 1 : state === 'past' ? 0.18 : 0.42,
        scale: state === 'active' ? 1 : 0.975,
        y: state === 'active' ? 0 : state === 'past' ? -2 : 4,
        filter:
          state === 'active'
            ? 'blur(0px)'
            : state === 'past'
              ? 'blur(0.4px)'
              : 'blur(0.8px)',
      }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'min-h-14 px-2 text-center text-xl font-medium tracking-tight text-white/70 transition-colors md:text-3xl',
        state === 'active' && 'text-white',
      )}
    >
      <span
        className={cn(
          'inline-block rounded-2xl px-4 py-2 transition-all duration-500',
          state === 'active' &&
            'bg-white/10 shadow-[0_18px_40px_rgba(15,23,42,0.28),0_0_30px_rgba(124,161,255,0.18)] backdrop-blur-md',
        )}
      >
        {line.text || <span className="opacity-0">.</span>}
      </span>
    </motion.div>
  ),
  (previous, next) =>
    previous.line.id === next.line.id && previous.state === next.state,
)
