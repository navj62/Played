import { useForm } from 'react-hook-form'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { PlaySquare, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { login } from '../api/users'
import useAuthStore from '../store/authStore'

export default function Login() {
  const [showPw, setShowPw] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { setUser } = useAuthStore()
  const from = location.state?.from?.pathname || '/'

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm()

  const { mutate, isPending } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setUser(data.user)
      navigate(from, { replace: true })
    },
    onError: (err) => {
      setError('root', { message: err.response?.data?.message || 'Invalid credentials' })
    },
  })

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-ct-red rounded-lg flex items-center justify-center mb-4">
            <PlaySquare className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-ct-text">Welcome back</h1>
          <p className="text-ct-muted text-sm mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit(mutate)} className="space-y-4" noValidate>
          {errors.root && (
            <div className="bg-ct-red-dim border border-ct-red/30 rounded-lg px-4 py-3 text-ct-red text-sm">
              {errors.root.message}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-xs font-medium text-ct-muted mb-1.5">
              Email or username
            </label>
            <input
              id="email"
              type="text"
              autoComplete="username"
              placeholder="you@example.com"
              {...register('email', { required: 'Required' })}
              className="w-full bg-ct-elevated border border-ct-border rounded-lg px-4 py-2.5 text-sm text-ct-text placeholder:text-ct-subtle focus:outline-none focus:border-ct-subtle transition-colors duration-150"
            />
            {errors.email && <p className="text-xs text-ct-red mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="text-xs font-medium text-ct-muted">
                Password
              </label>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                {...register('password', { required: 'Required' })}
                className="w-full bg-ct-elevated border border-ct-border rounded-lg px-4 py-2.5 pr-10 text-sm text-ct-text placeholder:text-ct-subtle focus:outline-none focus:border-ct-subtle transition-colors duration-150"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ct-subtle hover:text-ct-muted cursor-pointer transition-colors duration-150"
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-ct-red mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-ct-red hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition-colors duration-150 cursor-pointer mt-2"
          >
            {isPending ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-ct-muted mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-ct-text font-medium hover:text-ct-red transition-colors duration-150 cursor-pointer">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
