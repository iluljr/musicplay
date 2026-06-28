import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLocation, useOutlet } from 'react-router-dom'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { CinematicBackground } from '@/components/background/CinematicBackground'
import { FloatingPlayer } from '@/components/player/FloatingPlayer'
import { useAppBootstrap } from '@/hooks/useAppBootstrap'
import { useAudioEngine } from '@/hooks/useAudioEngine'
import { useDisplayMode } from '@/hooks/useDisplayMode'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useObsEnvironment } from '@/hooks/useObsEnvironment'
import { usePageVisibility } from '@/hooks/usePageVisibility'
import { useViewportSize } from '@/hooks/useViewportSize'
import { usePlayerStore } from '@/stores/playerStore'

export const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()
  const outlet = useOutlet()
  const displayMode = useDisplayMode()
  const isPageVisible = usePageVisibility()
  const activeSong = usePlayerStore((state) => state.tracks[state.activeIndex] ?? null)

  useAppBootstrap()
  useAudioEngine()
  useKeyboardShortcuts()
  useViewportSize()
  useObsEnvironment({
    transparentBackground: displayMode.transparentBackground,
  })

  useEffect(() => {
    setIsSidebarOpen(false)
  }, [location.pathname])

  if (!activeSong) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-base-950 text-white">
        Loading MusicPlay...
      </main>
    )
  }

  const showShell = !displayMode.isOverlay && !displayMode.isMinimal

  return (
    <main
      className={`relative isolate text-white ${
        displayMode.transparentBackground ? 'bg-transparent' : 'bg-base-950'
      }`}
      style={{
        minHeight: 'var(--app-height, 100vh)',
        height: 'var(--app-height, 100vh)',
        overflowX: 'hidden',
        overflowY: displayMode.compactLayout ? 'hidden' : 'auto',
      }}
    >
      <CinematicBackground
        animated={isPageVisible}
        track={activeSong}
        transparent={displayMode.transparentBackground}
      />

      <div className="relative z-10 mx-auto flex min-h-[var(--app-height,100vh)] max-w-[1600px]">
        {showShell ? (
          <AppSidebar
            isOpen={isSidebarOpen}
            onToggle={() => setIsSidebarOpen((value) => !value)}
          />
        ) : null}

        <div
          className={`min-w-0 flex-1 ${
            displayMode.compactLayout
              ? 'px-3 py-3 sm:px-4 sm:py-4'
              : 'px-4 py-4 sm:px-6 sm:py-6 lg:px-8'
          }`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname || 'home'}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              {outlet}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {showShell ? <FloatingPlayer /> : null}
    </main>
  )
}
