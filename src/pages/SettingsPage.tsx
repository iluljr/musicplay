import { GlassPanel } from '@/components/common/GlassPanel'
import { RangeInput } from '@/components/common/RangeInput'
import { useSettingsStore } from '@/stores/settingsStore'

const selectClassName =
  'w-full rounded-2xl border border-white/10 bg-base-900/90 px-4 py-3 text-sm text-white outline-none transition-colors hover:border-white/20 focus:border-accent-300/45 [color-scheme:dark]'

export const SettingsPage = () => {
  const { loading, settings, updateSetting } = useSettingsStore()

  if (loading || !settings) {
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
              checked={settings.autoPlay}
              onChange={(event) => updateSetting('autoPlay', event.target.checked)}
              type="checkbox"
            />
          </label>
          <label className="flex items-center justify-between gap-4">
            <span className="text-sm text-white/65">OBS Mode</span>
            <input
              checked={settings.obsMode}
              onChange={(event) => updateSetting('obsMode', event.target.checked)}
              type="checkbox"
            />
          </label>
          <label className="flex items-center justify-between gap-4">
            <span className="text-sm text-white/65">Loop</span>
            <input
              checked={settings.loop}
              onChange={(event) => updateSetting('loop', event.target.checked)}
              type="checkbox"
            />
          </label>
          <label className="flex items-center justify-between gap-4">
            <span className="text-sm text-white/65">Shuffle</span>
            <input
              checked={settings.shuffle}
              onChange={(event) => updateSetting('shuffle', event.target.checked)}
              type="checkbox"
            />
          </label>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/65">Crossfade Duration</span>
              <span className="text-sm text-white/45">{settings.crossfadeDuration}s</span>
            </div>
            <RangeInput
              max={12}
              min={0}
              onChange={(event) =>
                updateSetting('crossfadeDuration', Number(event.target.value))
              }
              step={0.5}
              value={settings.crossfadeDuration}
            />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/65">Volume</span>
              <span className="text-sm text-white/45">{settings.volume}</span>
            </div>
            <RangeInput
              max={100}
              min={0}
              onChange={(event) => updateSetting('volume', Number(event.target.value))}
              value={settings.volume}
            />
          </div>
        </GlassPanel>

        <GlassPanel className="space-y-5 p-5">
          <h2 className="text-lg font-semibold text-white">Visual</h2>
          <div className="space-y-3">
            <span className="text-sm text-white/65">Theme</span>
            <select
              className={selectClassName}
              onChange={(event) => updateSetting('theme', event.target.value as typeof settings.theme)}
              value={settings.theme}
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
              value={settings.accentColor}
            />
          </div>
          <div className="space-y-3">
            <span className="text-sm text-white/65">Lyrics Animation</span>
            <select
              className={selectClassName}
              onChange={(event) =>
                updateSetting(
                  'lyricsAnimation',
                  event.target.value as typeof settings.lyricsAnimation,
                )
              }
              value={settings.lyricsAnimation}
            >
              <option value="cinematic">Cinematic</option>
              <option value="smooth">Smooth</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/65">Lyrics Size</span>
              <span className="text-sm text-white/45">{settings.lyricsSize}px</span>
            </div>
            <RangeInput
              max={48}
              min={18}
              onChange={(event) => updateSetting('lyricsSize', Number(event.target.value))}
              value={settings.lyricsSize}
            />
          </div>
          <div className="space-y-3">
            <span className="text-sm text-white/65">Visualizer Style</span>
            <select
              className={selectClassName}
              onChange={(event) =>
                updateSetting(
                  'visualizerStyle',
                  event.target.value as typeof settings.visualizerStyle,
                )
              }
              value={settings.visualizerStyle}
            >
              <option value="ambient">Ambient</option>
              <option value="bars">Bars</option>
              <option value="wave">Wave</option>
            </select>
          </div>
        </GlassPanel>
      </div>
    </div>
  )
}
