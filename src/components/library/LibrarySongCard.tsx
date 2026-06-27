import { Copy, Pencil, Play, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { AssetBadges } from '@/components/library/AssetBadges'
import type { Song } from '@/types/song'
import { formatTime } from '@/utils/time'

type LibrarySongCardProps = {
  isSelected: boolean
  onDelete: (songId: string) => void
  onDuplicate: (songId: string) => void
  onEdit: (song: Song) => void
  onPlay: (songId: string) => void
  onToggleSelected: (songId: string) => void
  song: Song
}

export const LibrarySongCard = ({
  isSelected,
  onDelete,
  onDuplicate,
  onEdit,
  onPlay,
  onToggleSelected,
  song,
}: LibrarySongCardProps) => (
  <motion.div
    whileHover={{ y: -3 }}
    className={`overflow-hidden rounded-[1.75rem] border transition-colors ${
      isSelected
        ? 'border-accent-300/30 bg-accent-400/10'
        : 'border-white/8 bg-white/[0.03] hover:bg-white/[0.05]'
    }`}
  >
    <div
      className="aspect-[4/3] w-full border-b border-white/8"
      style={{
        background: song.cover.startsWith('gradient://')
          ? song.cover.replace('gradient://', 'linear-gradient(135deg, #').replace('/', ', #') + ')'
          : `url(${song.cover}) center / cover`,
      }}
    />
    <div className="space-y-4 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-medium text-white">{song.title}</p>
          <p className="truncate text-sm text-white/45">{song.artist}</p>
        </div>
        <input
          checked={isSelected}
          onChange={() => onToggleSelected(song.id)}
          type="checkbox"
        />
      </div>
      <div className="flex items-center justify-between text-sm text-white/40">
        <span>{formatTime(song.duration)}</span>
        <span>{song.playCount} plays</span>
      </div>
      <AssetBadges song={song} compact />
      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-full border border-white/10 bg-white/8 px-3 py-2 text-xs text-white/75"
          onClick={() => onPlay(song.id)}
          type="button"
        >
          <span className="inline-flex items-center gap-2">
            <Play className="h-3.5 w-3.5 fill-current" /> Play
          </span>
        </button>
        <button
          className="rounded-full border border-white/10 bg-white/8 px-3 py-2 text-xs text-white/75"
          onClick={() => onEdit(song)}
          type="button"
        >
          <span className="inline-flex items-center gap-2">
            <Pencil className="h-3.5 w-3.5" /> Edit
          </span>
        </button>
        <button
          className="rounded-full border border-white/10 bg-white/8 px-3 py-2 text-xs text-white/75"
          onClick={() => onDuplicate(song.id)}
          type="button"
        >
          <span className="inline-flex items-center gap-2">
            <Copy className="h-3.5 w-3.5" /> Duplicate
          </span>
        </button>
        <button
          className="rounded-full border border-red-400/25 bg-red-500/10 px-3 py-2 text-xs text-red-100"
          onClick={() => onDelete(song.id)}
          type="button"
        >
          <span className="inline-flex items-center gap-2">
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </span>
        </button>
      </div>
    </div>
  </motion.div>
)
