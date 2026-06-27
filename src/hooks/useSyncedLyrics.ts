import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { usePlayerStore } from '@/stores/playerStore'
import { findActiveLyricLineIndex, parseLrc } from '@/utils/lrc'

export const useSyncedLyrics = () => {
  const { activeTrack, currentTime } = usePlayerStore(
    useShallow((state) => ({
      activeTrack: state.tracks[state.activeIndex],
      currentTime: state.currentTime,
    })),
  )

  const parsedLyrics = useMemo(
    () => parseLrc(activeTrack?.lyrics ?? ''),
    [activeTrack?.lyrics],
  )

  const activeIndex = useMemo(
    () => findActiveLyricLineIndex(parsedLyrics.lines, currentTime),
    [currentTime, parsedLyrics.lines],
  )

  return {
    parsedLyrics,
    activeIndex,
    track: activeTrack,
  }
}
