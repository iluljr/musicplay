import { useEffect } from 'react'
import { audioEngine } from '@/services/audioEngine'

export const useAudioEngine = (enabled: boolean) => {
  useEffect(() => {
    audioEngine.mount(enabled)
  }, [enabled])
}
