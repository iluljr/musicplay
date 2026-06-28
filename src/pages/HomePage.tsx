import { Link } from 'react-router-dom'
import { GlassPanel } from '@/components/common/GlassPanel'
import { PlayerCard } from '@/components/player/PlayerCard'
import { useDisplayMode } from '@/hooks/useDisplayMode'

export const HomePage = () => {
  const displayMode = useDisplayMode()

  if (!displayMode.showHero) {
    return (
      <div className="flex min-h-[var(--app-height,100vh)] items-center justify-center">
        <div className="w-full max-w-6xl">
          {displayMode.overlaySource === 'settings' ? (
            <div className="mb-4 flex justify-end">
              <Link
                className="rounded-full border border-white/10 bg-base-950/45 px-4 py-2 text-xs uppercase tracking-[0.28em] text-white/55 backdrop-blur-xl transition-colors hover:border-white/20 hover:text-white"
                to="/settings"
              >
                OBS Preview Active
              </Link>
            </div>
          ) : null}
          <PlayerCard />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.35em] text-white/40">Home</p>
        <h1 className="text-3xl font-semibold text-white sm:text-5xl">
          Premium browser playback for modern livestream production
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-white/45 sm:text-base">
          A cinematic player surface, modular queue and lyric system, and an app
          shell designed to grow into a complete music control suite for streamers.
        </p>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_340px]">
        <PlayerCard />
        <GlassPanel className="space-y-4 p-5">
          <p className="text-xs uppercase tracking-[0.35em] text-white/40">
            Architecture Notes
          </p>
          <div className="space-y-4 text-sm leading-7 text-white/55">
            <p>Mock APIs are isolated behind typed models for songs, playlists, and settings.</p>
            <p>Audio, lyrics, queue, and route shell are wired for future backend replacement.</p>
            <p>OBS-oriented display modes still work via URL parameters without breaking the app shell.</p>
          </div>
        </GlassPanel>
      </div>
    </div>
  )
}
