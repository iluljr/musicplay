import { useEffect } from 'react'
import { playerGateway } from '@/services/playerGateway'

export const useRealtimePlayerSync = () => {
  useEffect(() => {
    playerGateway.connect()
  }, [])
}
