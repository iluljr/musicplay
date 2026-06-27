import { useEffect } from 'react'
import { usePlayerStore } from '@/stores/playerStore'

export const useKeyboardShortcuts = () => {
  const togglePlay = usePlayerStore((state) => state.togglePlay)
  const playNext = usePlayerStore((state) => state.playNext)
  const playPrevious = usePlayerStore((state) => state.playPrevious)

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
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [playNext, playPrevious, togglePlay])
}
