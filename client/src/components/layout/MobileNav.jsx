import { NavLink } from 'react-router-dom'
import { Home, TrendingUp, History, Heart, User } from 'lucide-react'
import useAuthStore from '../../store/authStore'

const items = [
  { to: '/', icon: Home, label: 'Home', end: true },
  { to: '/?sort=trending', icon: TrendingUp, label: 'Trending' },
  { to: '/history', icon: History, label: 'History', auth: true },
  { to: '/liked', icon: Heart, label: 'Liked', auth: true },
]

export default function MobileNav() {
  const { user } = useAuthStore()

  const visibleItems = items.filter((item) => !item.auth || user)
  const profileItem = {
    to: user ? `/channel/${user.username}` : '/login',
    icon: User,
    label: user ? 'You' : 'Sign in',
  }
  const allItems = [...visibleItems.slice(0, 4), profileItem]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-ct-surface border-t border-ct-border z-30 flex h-14">
      {allItems.map(({ to, icon: Icon, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors duration-150 ${
              isActive ? 'text-ct-text' : 'text-ct-subtle hover:text-ct-muted'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.75} />
              <span className="text-[10px] font-medium">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
