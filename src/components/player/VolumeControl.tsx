import { Volume2 } from 'lucide-react'
import { RangeInput } from '@/components/common/RangeInput'
import { usePlayerStore } from '@/stores/playerStore'
import { useShallow } from 'zustand/react/shallow'

export const VolumeControl = () => {
  const { setVolume, volume } = usePlayerStore(
    useShallow((state) => ({
      setVolume: state.setVolume,
      volume: state.volume,
    })),
  )

  return (
    <div className="flex min-w-0 items-center gap-3 sm:gap-4">
      <Volume2 className="h-4 w-4 shrink-0 text-white/55" />
      <RangeInput
        accent="subtle"
        aria-label="Volume"
        max={100}
        onChange={(event) => setVolume(Number(event.target.value))}
        value={volume}
      />
      <span className="w-8 shrink-0 text-right text-xs text-white/45 sm:w-10 sm:text-sm">
        {volume}
      </span>
    </div>
  )
}
