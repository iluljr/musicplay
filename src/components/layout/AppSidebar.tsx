import {
  Disc3,
  Home,
  Info,
  Library,
  Music4,
  PanelLeftClose,
  PanelLeftOpen,
  Settings2,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import { GlassPanel } from '@/components/common/GlassPanel'
import { MiniPlayer } from '@/components/player/MiniPlayer'

const navigationItems = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/library', label: 'Library', icon: Library },
  { to: '/playlist', label: 'Playlist', icon: Music4 },
  { to: '/settings', label: 'Settings', icon: Settings2 },
  { to: '/about', label: 'About', icon: Info },
]

type AppSidebarProps = {
  isOpen: boolean
  onToggle: () => void
}

export const AppSidebar = ({ isOpen, onToggle }: AppSidebarProps) => (
  <>
    <button
      className="fixed left-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-base-950/80 text-white/75 backdrop-blur-xl lg:hidden"
      onClick={onToggle}
      type="button"
    >
      {isOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
    </button>

    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-30 bg-base-950/55 backdrop-blur-sm lg:hidden"
          onClick={onToggle}
        />
      ) : null}
    </AnimatePresence>

    <motion.aside
      initial={false}
      animate={{
        x: isOpen ? 0 : -24,
        opacity: isOpen ? 1 : 0,
      }}
      className={`fixed inset-y-0 left-0 z-40 w-[18.5rem] p-4 lg:hidden ${
        isOpen ? 'block' : 'pointer-events-none hidden'
      }`}
    >
      <GlassPanel className="flex h-full flex-col p-4">
        <div className="mb-6 flex items-center gap-3 px-2 pt-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-400/18 text-accent-100">
            <Disc3 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/40">MusicPlay</p>
            <p className="text-lg font-semibold text-white">Livestream Suite</p>
          </div>
        </div>

        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon

            return (
              <NavLink end={item.end} key={item.to} to={item.to}>
                {({ isActive }) => (
                  <motion.div
                    whileHover={{ x: 4 }}
                    className={`relative flex items-center gap-3 overflow-hidden rounded-2xl px-4 py-3 text-sm transition-colors ${
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-white/55 hover:bg-white/[0.04]'
                    }`}
                  >
                    {isActive ? (
                      <motion.span
                        layoutId="sidebar-active-pill"
                        className="absolute inset-0 rounded-2xl border border-accent-300/25 bg-accent-400/12"
                      />
                    ) : null}
                    <Icon className="relative z-10 h-4.5 w-4.5" />
                    <span className="relative z-10">{item.label}</span>
                  </motion.div>
                )}
              </NavLink>
            )
          })}
        </nav>

        <div className="mt-auto pt-6">
          <GlassPanel subtle className="p-3">
            <MiniPlayer />
          </GlassPanel>
        </div>
      </GlassPanel>
    </motion.aside>

    <aside className="sticky top-0 hidden h-screen w-[18.5rem] p-4 lg:block">
      <GlassPanel className="flex h-full flex-col p-4">
        <div className="mb-6 flex items-center gap-3 px-2 pt-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-400/18 text-accent-100">
            <Disc3 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/40">MusicPlay</p>
            <p className="text-lg font-semibold text-white">Livestream Suite</p>
          </div>
        </div>

        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon

            return (
              <NavLink end={item.end} key={item.to} to={item.to}>
                {({ isActive }) => (
                  <motion.div
                    whileHover={{ x: 4 }}
                    className={`relative flex items-center gap-3 overflow-hidden rounded-2xl px-4 py-3 text-sm transition-colors ${
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-white/55 hover:bg-white/[0.04]'
                    }`}
                  >
                    {isActive ? (
                      <motion.span
                        layoutId="sidebar-active-pill"
                        className="absolute inset-0 rounded-2xl border border-accent-300/25 bg-accent-400/12"
                      />
                    ) : null}
                    <Icon className="relative z-10 h-4.5 w-4.5" />
                    <span className="relative z-10">{item.label}</span>
                  </motion.div>
                )}
              </NavLink>
            )
          })}
        </nav>

        <div className="mt-auto pt-6">
          <GlassPanel subtle className="p-3">
            <MiniPlayer />
          </GlassPanel>
        </div>
      </GlassPanel>
    </aside>
  </>
)
