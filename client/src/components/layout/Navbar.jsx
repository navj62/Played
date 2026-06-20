import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Search, Upload, Bell, PlaySquare, X, LogOut, User } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { logout as logoutApi } from '../../api/users'

export default function Navbar() {
  const [query, setQuery] = useState('')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, logout } = useAuthStore()

  useEffect(() => {
    setQuery(searchParams.get('q') || '')
  }, [searchParams])

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) navigate(`/?q=${encodeURIComponent(query.trim())}`)
    else navigate('/')
  }

  const handleLogout = async () => {
    try {
      await logoutApi()
    } catch {}
    logout()
    setUserMenuOpen(false)
    navigate('/')
  }

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-56 z-30 h-14 bg-ct-black/95 backdrop-blur-sm border-b border-ct-border flex items-center px-4 gap-3">
      {/* Mobile logo */}
      <Link to="/" className="lg:hidden flex items-center gap-2 flex-shrink-0 cursor-pointer">
        <div className="w-7 h-7 bg-ct-red rounded flex items-center justify-center">
          <PlaySquare className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-ct-text text-sm tracking-tight">VideoTube</span>
      </Link>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-lg mx-auto">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-ct-subtle pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="w-full bg-ct-elevated border border-ct-border rounded-full pl-10 pr-4 py-2 text-sm text-ct-text placeholder:text-ct-subtle focus:outline-none focus:border-ct-subtle transition-colors duration-150"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); navigate('/') }}
              className="absolute right-3.5 text-ct-subtle hover:text-ct-muted cursor-pointer transition-colors duration-150"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </form>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {user ? (
          <>
            <Link
              to="/upload"
              className="hidden sm:flex items-center gap-1.5 border border-ct-border hover:border-ct-hover text-ct-muted hover:text-ct-text text-xs font-medium px-3 py-1.5 rounded-full cursor-pointer transition-colors duration-150"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload
            </Link>

            <button
              className="p-2 rounded-full text-ct-subtle hover:text-ct-muted hover:bg-ct-elevated cursor-pointer transition-colors duration-150"
              aria-label="Notifications"
            >
              <Bell className="w-4.5 h-4.5" size={18} />
            </button>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 cursor-pointer ring-2 ring-transparent hover:ring-ct-border transition-all duration-150"
                aria-label="User menu"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-ct-elevated flex items-center justify-center text-ct-muted text-xs font-bold">
                    {(user.fullName || user.username)?.[0]?.toUpperCase()}
                  </div>
                )}
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-10 w-52 bg-ct-elevated border border-ct-border rounded-lg shadow-2xl py-1 z-50">
                  <div className="px-4 py-3 border-b border-ct-border">
                    <p className="text-sm font-semibold text-ct-text truncate">{user.fullName}</p>
                    <p className="text-xs text-ct-muted truncate">@{user.username}</p>
                  </div>
                  <Link
                    to={`/channel/${user.username}`}
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-ct-muted hover:text-ct-text hover:bg-ct-hover cursor-pointer transition-colors duration-150"
                  >
                    <User className="w-4 h-4" />
                    Your Channel
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-ct-muted hover:text-ct-text hover:bg-ct-hover cursor-pointer transition-colors duration-150"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-sm font-medium text-ct-muted hover:text-ct-text cursor-pointer transition-colors duration-150 px-3 py-1.5"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium bg-ct-red hover:bg-red-700 text-white px-4 py-1.5 rounded-full cursor-pointer transition-colors duration-150"
            >
              Join
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
