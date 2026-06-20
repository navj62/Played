import { NavLink } from 'react-router-dom'
import { Home, TrendingUp, History, Heart, Upload, BarChart2, Settings, PlaySquare } from 'lucide-react'
import useAuthStore from '../../store/authStore'

const navItems = [
  { to: '/', icon: Home, label: 'Home', end: true },
  { to: '/?sort=trending', icon: TrendingUp, label: 'Trending' },
]

const libraryItems = [
  { to: '/history', icon: History, label: 'History' },
  { to: '/liked', icon: Heart, label: 'Liked' },
]

const channelItems = [
  { to: '/upload', icon: Upload, label: 'Upload' },
  { to: '/dashboard', icon: BarChart2, label: 'Dashboard' },
]

function NavItem({ to, icon: Icon, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150 cursor-pointer group ${
          isActive
            ? 'bg-ct-elevated text-ct-text border-l-2 border-ct-red pl-[10px]'
            : 'text-ct-muted hover:text-ct-text hover:bg-ct-elevated border-l-2 border-transparent pl-[10px]'
        }`
      }
    >
      <Icon className="w-4.5 h-4.5 flex-shrink-0" size={18} />
      <span className="truncate">{label}</span>
    </NavLink>
  )
}

function SectionLabel({ children }) {
  return (
    <p className="text-[10px] font-semibold text-ct-subtle uppercase tracking-widest px-3 mb-1 mt-5 first:mt-0">
      {children}
    </p>
  )
}

export default function Sidebar() {
  const { user } = useAuthStore()

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-56 bg-ct-surface border-r border-ct-border z-40 hidden lg:flex flex-col">
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-ct-border flex-shrink-0">
        <NavLink to="/" className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-7 h-7 bg-ct-red rounded flex items-center justify-center flex-shrink-0">
            <PlaySquare className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-ct-text text-base tracking-tight">VideoTube</span>
        </NavLink>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 scrollbar-none">
        <div className="space-y-0.5">
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </div>

        {user && (
          <>
            <SectionLabel>Library</SectionLabel>
            <div className="space-y-0.5">
              {libraryItems.map((item) => (
                <NavItem key={item.to} {...item} />
              ))}
            </div>

            <SectionLabel>Channel</SectionLabel>
            <div className="space-y-0.5">
              {channelItems.map((item) => (
                <NavItem key={item.to} {...item} />
              ))}
            </div>
          </>
        )}
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-4 border-t border-ct-border pt-3">
        <NavItem to="/settings" icon={Settings} label="Settings" />
      </div>
    </aside>
  )
}
