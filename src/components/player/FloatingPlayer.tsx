import { motion } from 'framer-motion'
import { GlassPanel } from '@/components/common/GlassPanel'
import { MiniPlayer } from '@/components/player/MiniPlayer'
import { ProgressBar } from '@/components/player/ProgressBar'

export const FloatingPlayer = () => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    className="fixed bottom-4 left-4 right-4 z-30 hidden xl:block"
  >
    <GlassPanel className="mx-auto max-w-4xl p-4">
      <div className="grid items-center gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <MiniPlayer />
        <ProgressBar />
      </div>
    </GlassPanel>
  </motion.div>
)
