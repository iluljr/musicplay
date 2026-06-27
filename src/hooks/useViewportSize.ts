import { useEffect } from 'react'

const applyViewportHeight = () => {
  const viewportHeight = window.visualViewport?.height ?? window.innerHeight
  document.documentElement.style.setProperty('--app-height', `${viewportHeight}px`)
}

export const useViewportSize = () => {
  useEffect(() => {
    applyViewportHeight()

    const handleResize = () => applyViewportHeight()

    window.addEventListener('resize', handleResize)
    window.visualViewport?.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.visualViewport?.removeEventListener('resize', handleResize)
    }
  }, [])
}
