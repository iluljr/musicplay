import { useEffect } from 'react'
import { usePlayerStore } from '@/stores/playerStore'

export const useKeyboardShortcuts = () => {
  const togglePlay = usePlayerStore((state) => state.togglePlay)
  const playNext = usePlayerStore((state) => state.playNext)
  const playPrevious = usePlayerStore((state) => state.playPrevious)
  const stop = usePlayerStore((state) => state.stop)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      if (event.code === 'Space') {
        event.preventDefault()
        togglePlay()
      }

      if (event.code === 'ArrowRight') {
        playNext()
      }

      if (event.code === 'ArrowLeft') {
        playPrevious()
      }

      if (event.code === 'KeyS') {
        stop()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [playNext, playPrevious, stop, togglePlay])
}
