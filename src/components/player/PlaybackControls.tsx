import {
  Square,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
} from 'lucide-react'
import { IconButton } from '@/components/common/IconButton'
import { VolumeControl } from '@/components/player/VolumeControl'
import { usePlayerStore } from '@/stores/playerStore'
import { useShallow } from 'zustand/react/shallow'

const playbackRates = [0.75, 1, 1.25, 1.5]

export const PlaybackControls = () => {
  const {
    isShuffleEnabled,
    playbackRate,
    playbackStatus,
    repeatMode,
    togglePlay,
    playNext,
    playPrevious,
    toggleShuffle,
    cycleRepeatMode,
    stop,
    setPlaybackRate,
  } = usePlayerStore(
    useShallow((state) => ({
      isShuffleEnabled: state.isShuffleEnabled,
      playbackRate: state.playbackRate,
      playbackStatus: state.playbackStatus,
      repeatMode: state.repeatMode,
      togglePlay: state.togglePlay,
      playNext: state.playNext,
      playPrevious: state.playPrevious,
      toggleShuffle: state.toggleShuffle,
      cycleRepeatMode: state.cycleRepeatMode,
      stop: state.stop,
      setPlaybackRate: state.setPlaybackRate,
    })),
  )
  const isPlaying = playbackStatus === 'playing' || playbackStatus === 'loading'

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
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
            <Pause className="h-5 w-5 fill-current sm:h-6 sm:w-6" />
          ) : (
            <Play className="ml-0.5 h-5 w-5 fill-current sm:h-6 sm:w-6" />
          )}
        </IconButton>
        <IconButton aria-label="Stop playback" onClick={stop}>
          <Square className="h-4.5 w-4.5 fill-current" />
        </IconButton>
        <IconButton aria-label="Play next track" onClick={playNext} size="lg">
          <SkipForward className="h-5 w-5 sm:h-6 sm:w-6" />
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

      <div className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-white/6 p-3 backdrop-blur-xl sm:p-4 md:grid-cols-[minmax(0,1fr)_auto]">
        <VolumeControl />

        <div className="flex flex-wrap items-center gap-2">
          {playbackRates.map((rate) => (
            <button
              key={rate}
              className={`rounded-full border px-2.5 py-1.5 text-xs transition-colors sm:px-3 sm:text-sm ${
                playbackRate === rate
                  ? 'border-accent-300/50 bg-accent-400/18 text-accent-100'
                  : 'border-white/10 bg-white/6 text-white/55 hover:bg-white/10 hover:text-white'
              }`}
              onClick={() => setPlaybackRate(rate)}
              type="button"
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
