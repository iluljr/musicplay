import { useEffect } from 'react'
import { audioEngine } from '@/services/audioEngine'

export const useAudioEngine = () => {
  useEffect(() => {
    audioEngine.mount()
  }, [])
}
