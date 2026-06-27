import { motion } from 'framer-motion'
import { useShallow } from 'zustand/react/shallow'
import { usePlayerStore } from '@/stores/playerStore'
import { cn } from '@/utils/cn'

type PlaylistPreviewProps = {
  compact?: boolean
}

export const PlaylistPreview = ({ compact = false }: PlaylistPreviewProps) => {
  const { activeIndex, tracks } = usePlayerStore(
    useShallow((state) => ({
      activeIndex: state.activeIndex,
      tracks: state.tracks,
    })),
  )

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.24em] text-white/35 sm:text-xs sm:tracking-[0.3em]">
        <span>Playlist</span>
        <span>{tracks.length} tracks</span>
      </div>

      <div className={cn('space-y-2', compact && 'space-y-1.5')}>
        {tracks.map((track, index) => {
          const isActive = index === activeIndex

          return (
            <motion.div
              key={track.id}
              layout
              className={cn(
                'flex items-center justify-between gap-3 rounded-2xl border border-white/8 px-3 py-3 text-sm backdrop-blur-md transition-colors sm:px-4',
                isActive ? 'bg-white/10 text-white' : 'bg-white/[0.03] text-white/50',
              )}
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{track.title}</p>
                <p className="truncate text-xs uppercase tracking-[0.25em] text-white/35">
                  {track.artist}
                </p>
              </div>
              <div
                className={cn(
                  'h-2.5 w-2.5 rounded-full',
                  isActive ? 'bg-accent-300 shadow-[0_0_16px_rgba(124,161,255,0.8)]' : 'bg-white/15',
                )}
              />
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
