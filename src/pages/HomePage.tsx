import { motion } from 'framer-motion'
import { CinematicBackground } from '@/components/background/CinematicBackground'
import { PlayerCard } from '@/components/player/PlayerCard'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

export const HomePage = () => {
  useKeyboardShortcuts()

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-base-950 text-white">
      <CinematicBackground />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-4"
          >
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs uppercase tracking-[0.35em] text-white/55 backdrop-blur-xl">
              MusicPlay
            </span>
            <div className="max-w-3xl">
              <h1 className="text-5xl font-semibold tracking-tight text-white md:text-7xl">
                A cinematic browser source for now playing moments.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/50 md:text-lg">
                Designed for OBS overlays with premium motion, glass surfaces,
                and a modular player shell ready for playlists, lyrics, and
                remote sync.
              </p>
            </div>
          </motion.div>

          <PlayerCard />
        </div>
      </div>
    </main>
  )
}
