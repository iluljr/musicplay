import { useState } from 'react'
import { Copy, Pencil, Play, Plus, Trash2, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { GlassPanel } from '@/components/common/GlassPanel'
import { PlaybackControls } from '@/components/player/PlaybackControls'
import { usePlaylistCollection } from '@/hooks/usePlaylistCollection'
import { formatTime } from '@/utils/time'
import { getSongPalette } from '@/utils/song'

export const PlaylistPage = () => {
  const {
    activePlaylist,
    activePlaylistId,
    activeSongId,
    activatePlaylistQueue,
    addSongToPlaylist,
    availableSongs,
    createPlaylist,
    deletePlaylist,
    duplicatePlaylist,
    isQueueActive,
    loading,
    playlistSongs,
    playlists,
    removeSongFromPlaylist,
    renamePlaylist,
    reorderSongs,
    selectPlaylist,
    setPlaylistSongs,
    totalDuration,
  } = usePlaylistCollection()
  const [draftName, setDraftName] = useState('')
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <div className="space-y-4">
        <GlassPanel className="p-4">
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/40">Playlist</p>
              <h1 className="mt-2 text-2xl font-semibold text-white">Manage scenes and sets</h1>
            </div>
            <div className="flex gap-2">
              <input
                className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25"
                onChange={(event) => setDraftName(event.target.value)}
                placeholder="New playlist name"
                value={draftName}
              />
              <button
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-white/80"
                onClick={() => {
                  void createPlaylist(draftName.trim() || 'Untitled Playlist')
                  setDraftName('')
                }}
                type="button"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </GlassPanel>

        <div className="space-y-3">
          {playlists.map((playlist) => (
            <motion.button
              key={playlist.id}
              whileHover={{ x: 4 }}
              className={`w-full rounded-[1.5rem] border p-4 text-left ${
                playlist.id === activePlaylistId
                  ? 'border-accent-300/30 bg-accent-400/12 text-white'
                  : 'border-white/8 bg-white/[0.03] text-white/60'
              }`}
              onClick={() => selectPlaylist(playlist.id)}
              type="button"
            >
              <p className="text-sm font-medium">{playlist.name}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.24em] text-white/35">
                {playlist.songs.length} songs
              </p>
            </motion.button>
          ))}
        </div>
      </div>

      <GlassPanel className="space-y-5 p-4 sm:p-5">
        {loading || !activePlaylist ? (
          <div className="flex min-h-[420px] items-center justify-center text-white/40">
            Loading playlist...
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.35em] text-white/40">
                  Selected Playlist
                </p>
                <input
                  className="w-full max-w-xl bg-transparent text-3xl font-semibold text-white outline-none"
                  onBlur={(event) => {
                    const nextName = event.target.value.trim()
                    if (nextName && nextName !== activePlaylist.name) {
                      void renamePlaylist(activePlaylist.id, nextName)
                    }
                  }}
                  defaultValue={activePlaylist.name}
                />
                <p className="max-w-2xl text-sm text-white/45">{activePlaylist.description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className="rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm text-white/75"
                  onClick={() => void duplicatePlaylist(activePlaylist.id)}
                  type="button"
                >
                  <span className="inline-flex items-center gap-2">
                    <Copy className="h-4 w-4" /> Duplicate
                  </span>
                </button>
                <button
                  className="rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm text-white/75"
                  onClick={() => {
                    const nextName = window.prompt('Rename playlist', activePlaylist.name)?.trim()
                    if (!nextName || nextName === activePlaylist.name) {
                      return
                    }

                    void renamePlaylist(activePlaylist.id, nextName)
                  }}
                  type="button"
                >
                  <span className="inline-flex items-center gap-2">
                    <Pencil className="h-4 w-4" /> Rename
                  </span>
                </button>
                <button
                  className="rounded-full border border-red-400/25 bg-red-500/10 px-4 py-2 text-sm text-red-100"
                  onClick={() => {
                    if (!window.confirm(`Delete playlist "${activePlaylist.name}"?`)) {
                      return
                    }

                    void deletePlaylist(activePlaylist.id)
                  }}
                  type="button"
                >
                  <span className="inline-flex items-center gap-2">
                    <Trash2 className="h-4 w-4" /> Delete
                  </span>
                </button>
                <button
                  className={`rounded-full border px-4 py-2 text-sm ${
                    isQueueActive
                      ? 'border-accent-300/40 bg-accent-400/14 text-accent-100'
                      : 'border-white/10 bg-white/8 text-white/75'
                  }`}
                  onClick={() =>
                    activatePlaylistQueue(activePlaylist.id, activePlaylist.songs[0], false)
                  }
                  type="button"
                >
                  Use as Queue
                </button>
                <button
                  className="rounded-full border border-accent-300/30 bg-accent-400/12 px-4 py-2 text-sm text-accent-100"
                  onClick={() =>
                    activatePlaylistQueue(activePlaylist.id, activePlaylist.songs[0], true)
                  }
                  type="button"
                >
                  <span className="inline-flex items-center gap-2">
                    <Play className="h-4 w-4" /> Play Playlist
                  </span>
                </button>
              </div>
            </div>

            <div className="grid gap-4 rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4 sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/35">Songs</p>
                <p className="mt-2 text-2xl font-semibold text-white">{playlistSongs.length}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/35">Duration</p>
                <p className="mt-2 text-2xl font-semibold text-white">{formatTime(totalDuration)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/35">Updated</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {new Date(activePlaylist.updatedAt).getFullYear()}
                </p>
              </div>
            </div>

            <GlassPanel className="p-4">
              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-white/35">
                    Playlist Transport
                  </p>
                  <p className="mt-2 text-sm text-white/50">
                    Jadikan playlist ini sebagai queue aktif, lalu gunakan kontrol di bawah
                    untuk play, pause, stop, next, dan previous.
                  </p>
                </div>
                <PlaybackControls />
              </div>
            </GlassPanel>

            <div className="space-y-3">
              {playlistSongs.length === 0 ? (
                <div className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-6 text-sm text-white/45">
                  Playlist ini masih kosong. Tambahkan lagu dari library di panel bawah.
                </div>
              ) : null}

              {playlistSongs.map((song, index) => {
                const [primary, secondary] = getSongPalette(song)
                const isNowPlaying = song.id === activeSongId

                return (
                  <motion.div
                    key={song.id}
                    layout
                    draggable
                    onDragOver={(event) => event.preventDefault()}
                    onDragStart={() => setDragIndex(index)}
                    onDrop={() => {
                      if (dragIndex === null) {
                        return
                      }

                      void reorderSongs(activePlaylist.id, dragIndex, index)
                      setDragIndex(null)
                    }}
                    whileHover={{ y: -2 }}
                    className={`flex items-center gap-4 rounded-[1.5rem] border p-4 ${
                      isNowPlaying
                        ? 'border-accent-300/35 bg-accent-400/15'
                        : 'border-white/8 bg-white/[0.03]'
                    }`}
                  >
                    <div
                      className="h-14 w-14 shrink-0 rounded-2xl border border-white/10"
                      style={{
                        background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{song.title}</p>
                      <p className="truncate text-xs uppercase tracking-[0.25em] text-white/35">
                        {song.artist} · {song.album}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/70"
                        onClick={() => activatePlaylistQueue(activePlaylist.id, song.id, true)}
                        type="button"
                      >
                        Play
                      </button>
                      <button
                        className="rounded-full border border-red-400/20 px-3 py-2 text-xs text-red-100/80"
                        onClick={() => void removeSongFromPlaylist(activePlaylist.id, song.id)}
                        type="button"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-sm text-white/35">{formatTime(song.duration)}</span>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            <GlassPanel className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-white/35">
                      Library Songs
                    </p>
                    <p className="mt-2 text-sm text-white/50">
                      Lagu hasil import tidak otomatis masuk ke playlist. Tambahkan dari sini.
                    </p>
                  </div>
                  {playlistSongs.length > 0 ? (
                    <button
                      className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/70"
                      onClick={() => void setPlaylistSongs(activePlaylist.id, [])}
                      type="button"
                    >
                      Clear Playlist
                    </button>
                  ) : null}
                </div>

                <div className="space-y-3">
                  {availableSongs.length === 0 ? (
                    <div className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-6 text-sm text-white/45">
                      Semua lagu di library sudah masuk ke playlist ini.
                    </div>
                  ) : (
                    availableSongs.map((song) => (
                      <div
                        key={song.id}
                        className="flex items-center gap-4 rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-4"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white">{song.title}</p>
                          <p className="truncate text-xs uppercase tracking-[0.25em] text-white/35">
                            {song.artist} · {song.album}
                          </p>
                        </div>
                        <span className="text-sm text-white/35">{formatTime(song.duration)}</span>
                        <button
                          className="rounded-full border border-accent-300/25 bg-accent-400/10 px-4 py-2 text-sm text-accent-100"
                          onClick={() => void addSongToPlaylist(activePlaylist.id, song.id)}
                          type="button"
                        >
                          Add
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </GlassPanel>
          </>
        )}
      </GlassPanel>
    </div>
  )
}
