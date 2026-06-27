import { Copy, Pencil, Play, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { AssetBadges } from '@/components/library/AssetBadges'
import type { Song } from '@/types/song'
import { formatTime } from '@/utils/time'

type LibrarySongRowProps = {
  isSelected: boolean
  onDelete: (songId: string) => void
  onDuplicate: (songId: string) => void
  onEdit: (song: Song) => void
  onPlay: (songId: string) => void
  onToggleSelected: (songId: string) => void
  song: Song
}

export const LibrarySongRow = ({
  isSelected,
  onDelete,
  onDuplicate,
  onEdit,
  onPlay,
  onToggleSelected,
  song,
}: LibrarySongRowProps) => (
  <motion.div
    whileHover={{ y: -2 }}
    className={`grid gap-3 rounded-[1.75rem] border p-4 transition-colors xl:grid-cols-[42px_84px_minmax(0,1.3fr)_minmax(0,1fr)_120px_280px_110px_180px] ${
      isSelected
        ? 'border-accent-300/30 bg-accent-400/10'
        : 'border-white/8 bg-white/[0.03] hover:bg-white/[0.05]'
    }`}
  >
    <div className="flex items-center">
      <input checked={isSelected} onChange={() => onToggleSelected(song.id)} type="checkbox" />
    </div>
    <div
      className="h-16 w-16 rounded-2xl border border-white/10"
      style={{
        background: song.cover.startsWith('gradient://')
          ? song.cover.replace('gradient://', 'linear-gradient(135deg, #').replace('/', ', #') + ')'
          : `url(${song.cover}) center / cover`,
      }}
    />
    <div className="min-w-0">
      <p className="truncate text-sm font-medium text-white">{song.title}</p>
      <p className="truncate text-xs uppercase tracking-[0.24em] text-white/35">
        {song.genre} · {song.year}
      </p>
    </div>
    <div className="text-sm text-white/55">
      <p>{song.artist}</p>
      <p className="text-xs uppercase tracking-[0.24em] text-white/35">{song.album}</p>
    </div>
    <div className="text-sm text-white/55">{formatTime(song.duration)}</div>
    <AssetBadges song={song} compact />
    <div className="text-sm text-white/45">{song.lastPlayed ? new Date(song.lastPlayed).toLocaleDateString() : 'Never'}</div>
    <div className="flex flex-wrap gap-2">
      <button className="rounded-full border border-white/10 bg-white/8 p-2 text-white/75" onClick={() => onPlay(song.id)} type="button">
        <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
      </button>
      <button className="rounded-full border border-white/10 bg-white/8 p-2 text-white/75" onClick={() => onEdit(song)} type="button">
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button className="rounded-full border border-white/10 bg-white/8 p-2 text-white/75" onClick={() => onDuplicate(song.id)} type="button">
        <Copy className="h-3.5 w-3.5" />
      </button>
      <button className="rounded-full border border-red-400/25 bg-red-500/10 p-2 text-red-100" onClick={() => onDelete(song.id)} type="button">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  </motion.div>
)
