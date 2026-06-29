import { useMemo, useState } from 'react'
import { Copy, ExternalLink, MonitorUp, WandSparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { GlassPanel } from '@/components/common/GlassPanel'
import { RangeInput } from '@/components/common/RangeInput'
import { backendApi } from '@/services/backendApi'
import { playbackSession } from '@/services/playbackSession'
import { useSettingsStore } from '@/stores/settingsStore'
import { setPlayerStoreState } from '@/stores/playerStore'
import { buildObsSearchParams, buildObsSourceUrl } from '@/utils/obs'

const selectClassName =
  'w-full rounded-2xl border border-white/10 bg-base-900/90 px-4 py-3 text-sm text-white outline-none transition-colors hover:border-white/20 focus:border-accent-300/45 [color-scheme:dark]'

export const SettingsPage = () => {
  const { loading, settings, updateSetting } = useSettingsStore()
  const [copied, setCopied] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const resolvedSettings = settings

  const obsPreviewPath = useMemo(
    () =>
      resolvedSettings
        ? `/overlay?${buildObsSearchParams(resolvedSettings).toString()}`
        : '/overlay',
    [resolvedSettings],
  )

  const obsSourceUrl = useMemo(
    () => (resolvedSettings ? buildObsSourceUrl(resolvedSettings) : ''),
    [resolvedSettings],
  )

  if (loading || !resolvedSettings) {
    return <div className="text-white/45">Loading settings...</div>
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.35em] text-white/40">Settings</p>
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">
          Tune the playback environment
        </h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassPanel className="space-y-5 p-5">
          <h2 className="text-lg font-semibold text-white">Playback</h2>
          <label className="flex items-center justify-between gap-4">
            <span className="text-sm text-white/65">Auto Play</span>
            <input
              checked={resolvedSettings.autoPlay}
              onChange={(event) => updateSetting('autoPlay', event.target.checked)}
              type="checkbox"
            />
          </label>
          <label className="flex items-center justify-between gap-4">
            <span className="text-sm text-white/65">OBS Mode</span>
            <input
              checked={resolvedSettings.obsMode}
              onChange={(event) => updateSetting('obsMode', event.target.checked)}
              type="checkbox"
            />
          </label>
          <label className="flex items-center justify-between gap-4">
            <span className="text-sm text-white/65">Loop</span>
            <input
              checked={resolvedSettings.loop}
              onChange={(event) => updateSetting('loop', event.target.checked)}
              type="checkbox"
            />
          </label>
          <label className="flex items-center justify-between gap-4">
            <span className="text-sm text-white/65">Shuffle</span>
            <input
              checked={resolvedSettings.shuffle}
              onChange={(event) => updateSetting('shuffle', event.target.checked)}
              type="checkbox"
            />
          </label>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/65">Crossfade Duration</span>
              <span className="text-sm text-white/45">{resolvedSettings.crossfadeDuration}s</span>
            </div>
            <RangeInput
              max={12}
              min={0}
              onChange={(event) =>
                updateSetting('crossfadeDuration', Number(event.target.value))
              }
              step={0.5}
              value={resolvedSettings.crossfadeDuration}
            />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/65">Volume</span>
              <span className="text-sm text-white/45">{resolvedSettings.volume}</span>
            </div>
            <RangeInput
              max={100}
              min={0}
              onChange={(event) => updateSetting('volume', Number(event.target.value))}
              value={resolvedSettings.volume}
            />
          </div>
          <div className="rounded-[1.5rem] border border-amber-300/12 bg-amber-300/5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-medium text-white">Reset Playback Session</p>
                <p className="text-sm leading-6 text-white/50">
                  Paksa semua tab dan overlay kembali ke kondisi awal: stop, time
                  ke 0, dan tidak ada player yang tetap jalan.
                </p>
              </div>
              <button
                className="rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-sm text-amber-100 transition-colors hover:bg-amber-300/15 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isResetting}
                onClick={async () => {
                  setIsResetting(true)
                  playbackSession.broadcastReset()
                  setPlayerStoreState({
                    playbackStatus: 'stopped',
                    currentTime: 0,
                    isShuffleEnabled: false,
                    repeatMode: 'all',
                    volume: 72,
                    playbackRate: 1,
                    error: null,
                  })

                  try {
                    await backendApi.resetPlayer()
                  } finally {
                    setIsResetting(false)
                  }
                }}
                type="button"
              >
                {isResetting ? 'Resetting...' : 'Reset Player'}
              </button>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="space-y-5 p-5">
          <h2 className="text-lg font-semibold text-white">Visual</h2>
          <div className="space-y-3">
            <span className="text-sm text-white/65">Theme</span>
            <select
              className={selectClassName}
              onChange={(event) =>
                updateSetting('theme', event.target.value as typeof resolvedSettings.theme)
              }
              value={resolvedSettings.theme}
            >
              <option value="midnight">Midnight</option>
              <option value="obsidian">Obsidian</option>
              <option value="graphite">Graphite</option>
            </select>
          </div>
          <div className="space-y-3">
            <span className="text-sm text-white/65">Accent Color</span>
            <input
              className="h-12 w-full rounded-2xl border border-white/10 bg-transparent"
              onChange={(event) => updateSetting('accentColor', event.target.value)}
              type="color"
              value={resolvedSettings.accentColor}
            />
          </div>
          <div className="space-y-3">
            <span className="text-sm text-white/65">Lyrics Animation</span>
            <select
              className={selectClassName}
              onChange={(event) =>
                updateSetting(
                  'lyricsAnimation',
                  event.target.value as typeof resolvedSettings.lyricsAnimation,
                )
              }
              value={resolvedSettings.lyricsAnimation}
            >
              <option value="cinematic">Cinematic</option>
              <option value="smooth">Smooth</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/65">Lyrics Size</span>
              <span className="text-sm text-white/45">{resolvedSettings.lyricsSize}px</span>
            </div>
            <RangeInput
              max={48}
              min={18}
              onChange={(event) => updateSetting('lyricsSize', Number(event.target.value))}
              value={resolvedSettings.lyricsSize}
            />
          </div>
          <div className="space-y-3">
            <span className="text-sm text-white/65">Visualizer Style</span>
            <select
              className={selectClassName}
              onChange={(event) =>
                updateSetting(
                  'visualizerStyle',
                  event.target.value as typeof resolvedSettings.visualizerStyle,
                )
              }
              value={resolvedSettings.visualizerStyle}
            >
              <option value="ambient">Ambient</option>
              <option value="bars">Bars</option>
              <option value="wave">Wave</option>
            </select>
          </div>
        </GlassPanel>
      </div>

      <GlassPanel className="space-y-5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.35em] text-white/40">OBS Browser Source</p>
            <h2 className="text-xl font-semibold text-white">Functioning overlay mode</h2>
            <p className="max-w-3xl text-sm leading-6 text-white/50">
              Use these switches to generate a ready-to-paste OBS Browser Source URL.
              URL parameters still override settings when you need a special scene variant.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              className="rounded-full border border-accent-300/30 bg-accent-400/12 px-4 py-2 text-sm text-accent-100 transition-colors hover:bg-accent-400/18"
              to={obsPreviewPath}
            >
              <span className="inline-flex items-center gap-2">
                <MonitorUp className="h-4 w-4" />
                Preview OBS Mode
              </span>
            </Link>
            <button
              className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/70 transition-colors hover:border-white/20 hover:text-white"
              onClick={async () => {
                await navigator.clipboard.writeText(obsSourceUrl)
                setCopied(true)
                window.setTimeout(() => setCopied(false), 1800)
              }}
              type="button"
            >
              <span className="inline-flex items-center gap-2">
                <Copy className="h-4 w-4" />
                {copied ? 'Copied' : 'Copy OBS URL'}
              </span>
            </button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <label className="flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-4 py-3">
              <span className="text-sm text-white/65">Enable OBS Mode</span>
              <input
                checked={resolvedSettings.obsMode}
                onChange={(event) => updateSetting('obsMode', event.target.checked)}
                type="checkbox"
              />
            </label>
            <label className="flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-4 py-3">
              <span className="text-sm text-white/65">Minimal Layout</span>
              <input
                checked={resolvedSettings.obsMinimal}
                onChange={(event) => updateSetting('obsMinimal', event.target.checked)}
                type="checkbox"
              />
            </label>
            <label className="flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-4 py-3">
              <span className="text-sm text-white/65">Show Cover</span>
              <input
                checked={resolvedSettings.obsShowCover}
                onChange={(event) => updateSetting('obsShowCover', event.target.checked)}
                type="checkbox"
              />
            </label>
            <label className="flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-4 py-3">
              <span className="text-sm text-white/65">Show Controls</span>
              <input
                checked={resolvedSettings.obsShowControls}
                onChange={(event) => updateSetting('obsShowControls', event.target.checked)}
                type="checkbox"
              />
            </label>
            <label className="flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-4 py-3">
              <span className="text-sm text-white/65">Show Queue</span>
              <input
                checked={resolvedSettings.obsShowPlaylist}
                onChange={(event) => updateSetting('obsShowPlaylist', event.target.checked)}
                type="checkbox"
              />
            </label>
            <label className="flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-4 py-3">
              <span className="text-sm text-white/65">Show Progress</span>
              <input
                checked={resolvedSettings.obsShowProgress}
                onChange={(event) => updateSetting('obsShowProgress', event.target.checked)}
                type="checkbox"
              />
            </label>
            <label className="flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-4 py-3">
              <span className="text-sm text-white/65">Show Lyrics</span>
              <input
                checked={resolvedSettings.obsShowLyrics}
                onChange={(event) => updateSetting('obsShowLyrics', event.target.checked)}
                type="checkbox"
              />
            </label>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-base-950/40 p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-white/35">
              <WandSparkles className="h-4 w-4" />
              Generated Browser Source
            </div>
            <p className="mt-3 text-sm leading-6 text-white/50">
              Paste this URL into OBS Browser Source. It opens the transparent overlay
              variant directly with your selected layout visibility.
            </p>
            <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-3 text-xs leading-6 text-white/65">
              {obsSourceUrl}
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-white/45">
              <ExternalLink className="h-4 w-4" />
              URL params like `?overlay=1&lyrics=1&cover=0` still override defaults.
            </div>
          </div>
        </div>
      </GlassPanel>
    </div>
  )
}
