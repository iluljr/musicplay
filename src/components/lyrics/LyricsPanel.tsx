import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSyncedLyrics } from '@/hooks/useSyncedLyrics'
import { LyricLineItem } from '@/components/lyrics/LyricLineItem'
import { cn } from '@/utils/cn'

export const LyricsPanel = () => {
  const { parsedLyrics, activeIndex, track } = useSyncedLyrics()
  const lineRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const hasLyricsAsset = Boolean(track.lyrics.trim())
  const hasTimedLyrics = parsedLyrics.lines.length > 0
  const hasMetadataOnlyLyrics =
    hasLyricsAsset &&
    !hasTimedLyrics &&
    Object.values(parsedLyrics.metadata).some((value) => Boolean(value?.trim()))

  useEffect(() => {
    if (activeIndex < 0) {
      return
    }

    const activeLine = parsedLyrics.lines[activeIndex]
    const node = lineRefs.current[activeLine.id]
    const container = scrollContainerRef.current

    if (!node || !container) {
      return
    }

    const containerRect = container.getBoundingClientRect()
    const nodeRect = node.getBoundingClientRect()
    const targetScrollTop =
      node.offsetTop - container.clientHeight / 2 + node.clientHeight / 2

    const isNearCenter =
      Math.abs(
        nodeRect.top +
          nodeRect.height / 2 -
          (containerRect.top + containerRect.height / 2),
      ) < 4

    if (isNearCenter) {
      return
    }

    container.scrollTo({
      top: Math.max(0, targetScrollTop),
      behavior: 'smooth',
    })
  }, [activeIndex, parsedLyrics.lines])

  return (
    <section className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.12 }}
        className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-white/35 sm:gap-3 sm:text-xs sm:tracking-[0.3em]"
      >
        <span>Lyrics Sync</span>
        {parsedLyrics.metadata.artist ? <span>{parsedLyrics.metadata.artist}</span> : null}
        {parsedLyrics.metadata.title ? <span>{parsedLyrics.metadata.title}</span> : null}
        {parsedLyrics.metadata.album ? <span>{parsedLyrics.metadata.album}</span> : null}
      </motion.div>

      <div className="relative overflow-hidden rounded-[1.75rem] border border-white/8 bg-white/[0.03]">
        <motion.div
          key={`${track.id}-lyrics-glow`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.34 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${track?.themeColor ?? '#7ca1ff'}14, transparent 55%)`,
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-base-950/95 to-transparent sm:h-20" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-base-950/95 to-transparent sm:h-20" />

        <div
          ref={scrollContainerRef}
          className="h-[16rem] overflow-y-auto px-3 py-[42%] [scrollbar-width:none] sm:h-[20rem] sm:px-4 sm:py-[45%]"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-3"
            >
              {parsedLyrics.lines.map((line, index) => {
                const state =
                  index === activeIndex
                    ? 'active'
                    : index < activeIndex
                      ? 'past'
                      : 'future'

                return (
                  <LyricLineItem
                    key={line.id}
                    line={line}
                    setRef={(node) => {
                      lineRefs.current[line.id] = node
                    }}
                    state={state}
                  />
                )
              })}

              {!hasTimedLyrics ? (
                <div
                  className={cn(
                    'flex min-h-40 items-center justify-center px-6 text-center text-white/35',
                  )}
                >
                  {hasMetadataOnlyLyrics
                    ? 'LRC loaded, but it only contains metadata. Add timestamped lines like [00:12.55]Your lyric text.'
                    : hasLyricsAsset
                      ? 'LRC loaded, but no timestamped lyric lines were found. Use [00:12.55]Your lyric text.'
                      : 'No synced lyrics available.'}
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
