import { GlassPanel } from '@/components/common/GlassPanel'

export const AboutPage = () => (
  <div className="space-y-6">
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-[0.35em] text-white/40">About</p>
      <h1 className="text-3xl font-semibold text-white sm:text-4xl">
        Premium livestream music software in progress
      </h1>
    </div>

    <GlassPanel className="space-y-4 p-5">
      <p className="text-sm leading-7 text-white/55">
        MusicPlay is being architected as a modular browser-based playback suite
        for OBS Studio, livestream overlays, synced lyrics, playlist control,
        and future remote integrations.
      </p>
      <p className="text-sm leading-7 text-white/55">
        The current build already separates domain models, mock APIs, player
        control, layout shell, and route-level features so backend APIs and real
        file import can replace the mock layer without rewriting the UI.
      </p>
    </GlassPanel>
  </div>
)
