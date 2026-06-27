import type { Song } from '@/types/song'
import { cn } from '@/utils/cn'

const badgeKinds = [
  { key: 'audio', label: 'Audio' },
  { key: 'cover', label: 'Cover' },
  { key: 'lyrics', label: 'Lyrics' },
  { key: 'background', label: 'Background' },
] as const

type AssetBadgesProps = {
  song: Song
  compact?: boolean
}

export const AssetBadges = ({ song, compact = false }: AssetBadgesProps) => (
  <div className="flex flex-wrap gap-2">
    {badgeKinds.map((badge) => {
      const hasAsset = Boolean(song.assets[badge.key])

      return (
        <span
          key={badge.key}
          className={cn(
            'rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.18em]',
            hasAsset
              ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100'
              : 'border-white/10 bg-white/[0.03] text-white/35',
            compact && 'px-2 py-0.5 text-[10px]',
          )}
        >
          {hasAsset ? '✓' : '•'} {badge.label}
        </span>
      )
    })}
  </div>
)
