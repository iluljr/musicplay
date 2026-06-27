import {
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
} from 'lucide-react'
import { IconButton } from '@/components/common/IconButton'
import { RangeInput } from '@/components/common/RangeInput'
import { usePlayerStore } from '@/stores/playerStore'

export const PlaybackControls = () => {
  const isPlaying = usePlayerStore((state) => state.isPlaying)
  const isShuffleEnabled = usePlayerStore((state) => state.isShuffleEnabled)
  const repeatMode = usePlayerStore((state) => state.repeatMode)
  const volume = usePlayerStore((state) => state.volume)
  const togglePlay = usePlayerStore((state) => state.togglePlay)
  const playNext = usePlayerStore((state) => state.playNext)
  const playPrevious = usePlayerStore((state) => state.playPrevious)
  const toggleShuffle = usePlayerStore((state) => state.toggleShuffle)
  const cycleRepeatMode = usePlayerStore((state) => state.cycleRepeatMode)
  const setVolume = usePlayerStore((state) => state.setVolume)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-center gap-3">
        <IconButton
          aria-label="Toggle shuffle"
          active={isShuffleEnabled}
          onClick={toggleShuffle}
        >
          <Shuffle className="h-5 w-5" />
        </IconButton>
        <IconButton
          aria-label="Play previous track"
          onClick={playPrevious}
          size="lg"
        >
          <SkipBack className="h-6 w-6" />
        </IconButton>
        <IconButton
          aria-label={isPlaying ? 'Pause playback' : 'Play track'}
          className="bg-white text-base-950 hover:bg-accent-100"
          onClick={togglePlay}
          size="lg"
        >
          {isPlaying ? (
            <Pause className="h-6 w-6 fill-current" />
          ) : (
            <Play className="ml-0.5 h-6 w-6 fill-current" />
          )}
        </IconButton>
        <IconButton aria-label="Play next track" onClick={playNext} size="lg">
          <SkipForward className="h-6 w-6" />
        </IconButton>
        <IconButton
          aria-label="Change repeat mode"
          active={repeatMode !== 'off'}
          onClick={cycleRepeatMode}
        >
          {repeatMode === 'one' ? (
            <Repeat1 className="h-5 w-5" />
          ) : (
            <Repeat className="h-5 w-5" />
          )}
        </IconButton>
      </div>

      <div className="flex items-center gap-4 rounded-full border border-white/10 bg-white/6 px-4 py-3 backdrop-blur-xl">
        <Volume2 className="h-4 w-4 text-white/55" />
        <RangeInput
          accent="subtle"
          aria-label="Volume"
          max={100}
          onChange={(event) => setVolume(Number(event.target.value))}
          value={volume}
        />
        <span className="w-10 text-right text-sm text-white/45">{volume}</span>
      </div>
    </div>
  )
}
