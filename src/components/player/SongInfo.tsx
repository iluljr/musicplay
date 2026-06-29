import { motion } from 'framer-motion'
import { usePlayerStore } from '@/stores/playerStore'
import type { Song } from '@/types/song'
import { useShallow } from 'zustand/react/shallow'

type SongInfoProps = {
  song: Song
}

export const SongInfo = ({ song }: SongInfoProps) => {
  const { error, playbackRate, playbackStatus } = usePlayerStore(
    useShallow((state) => ({
      error: state.error,
      playbackRate: state.playbackRate,
      playbackStatus: state.playbackStatus,
    })),
  )

  return (
    <motion.div
      layout
      className="space-y-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08 }}
        className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-white/50 sm:gap-3 sm:text-sm sm:tracking-[0.35em]"
      >
        <p className="text-accent-200/70">{song.genre}</p>
        <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] tracking-[0.25em] text-white/45">
          {playbackStatus}
        </span>
        <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] tracking-[0.25em] text-white/45">
          {playbackRate}x
        </span>
        <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] tracking-[0.25em] text-white/45">
          {song.year}
        </span>
      </motion.div>
      <div>
        <motion.h1
          key={`${song.id}-title`}
          initial={{ opacity: 0, y: 26, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
          transition={{ duration: 0.78, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl font-semibold tracking-tight text-white drop-shadow-[0_0_28px_rgba(255,255,255,0.08)] sm:text-4xl md:text-5xl"
        >
          {song.title}
        </motion.h1>
        <motion.p
          key={`${song.id}-artist`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.75, delay: 0.18, ease: 'easeOut' }}
          className="mt-2 text-base text-white/55 sm:mt-3 sm:text-lg md:text-xl"
        >
          {song.artist} · {song.album}
        </motion.p>
      </div>
      {error ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-orange-300/85"
        >
          {error}
        </motion.p>
      ) : null}
    </motion.div>
  )
}
