import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { PlaySquare, Eye, EyeOff, Upload, User } from 'lucide-react'
import { useState, useRef } from 'react'
import { register as registerUser } from '../api/users'
import useAuthStore from '../store/authStore'

export default function Register() {
  const [showPw, setShowPw] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const avatarRef = useRef(null)
  const navigate = useNavigate()
  const { setUser } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm()

  const { ref: avatarFormRef, onChange: onAvatarChange, ...avatarRest } = register('avatar')

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => {
      const fd = new FormData()
      fd.append('fullName', data.fullName)
      fd.append('username', data.username.toLowerCase())
      fd.append('email', data.email)
      fd.append('password', data.password)
      if (data.avatar?.[0]) fd.append('avatar', data.avatar[0])
      return registerUser(fd)
    },
    onSuccess: (data) => {
      setUser(data)
      navigate('/')
    },
    onError: (err) => {
      setError('root', { message: err.response?.data?.message || 'Registration failed' })
    },
  })

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (file) setAvatarPreview(URL.createObjectURL(file))
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-ct-red rounded-lg flex items-center justify-center mb-4">
            <PlaySquare className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-ct-text">Create account</h1>
          <p className="text-ct-muted text-sm mt-1">Join VideoTube today</p>
        </div>

        <form onSubmit={handleSubmit(mutate)} className="space-y-4" noValidate>
          {errors.root && (
            <div className="bg-ct-red-dim border border-ct-red/30 rounded-lg px-4 py-3 text-ct-red text-sm">
              {errors.root.message}
            </div>
          )}

          {/* Avatar upload */}
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => avatarRef.current?.click()}
              className="w-20 h-20 rounded-full bg-ct-elevated border-2 border-dashed border-ct-border hover:border-ct-red cursor-pointer transition-colors duration-150 flex items-center justify-center overflow-hidden relative group"
              aria-label="Upload avatar"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-ct-subtle group-hover:text-ct-red transition-colors duration-150" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center">
                <Upload className="w-5 h-5 text-white" />
              </div>
            </button>
            <p className="text-xs text-ct-subtle">Avatar (optional)</p>
            <input
              {...avatarRest}
              ref={(e) => { avatarFormRef(e); avatarRef.current = e }}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                onAvatarChange(e)
                handleAvatarChange(e)
              }}
            />
            {errors.avatar && <p className="text-xs text-ct-red">{errors.avatar.message}</p>}
          </div>

          <div>
            <label htmlFor="fullName" className="block text-xs font-medium text-ct-muted mb-1.5">Full name</label>
            <input
              id="fullName"
              type="text"
              placeholder="Jane Doe"
              {...register('fullName', { required: 'Required' })}
              className="w-full bg-ct-elevated border border-ct-border rounded-lg px-4 py-2.5 text-sm text-ct-text placeholder:text-ct-subtle focus:outline-none focus:border-ct-subtle transition-colors duration-150"
            />
            {errors.fullName && <p className="text-xs text-ct-red mt-1">{errors.fullName.message}</p>}
          </div>

          <div>
            <label htmlFor="username" className="block text-xs font-medium text-ct-muted mb-1.5">Username</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ct-subtle text-sm">@</span>
              <input
                id="username"
                type="text"
                placeholder="janedoe"
                {...register('username', {
                  required: 'Required',
                  pattern: { value: /^[a-zA-Z0-9_]+$/, message: 'Letters, numbers, underscores only' },
                })}
                className="w-full bg-ct-elevated border border-ct-border rounded-lg pl-8 pr-4 py-2.5 text-sm text-ct-text placeholder:text-ct-subtle focus:outline-none focus:border-ct-subtle transition-colors duration-150"
              />
            </div>
            {errors.username && <p className="text-xs text-ct-red mt-1">{errors.username.message}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-medium text-ct-muted mb-1.5">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register('email', {
                required: 'Required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
              })}
              className="w-full bg-ct-elevated border border-ct-border rounded-lg px-4 py-2.5 text-sm text-ct-text placeholder:text-ct-subtle focus:outline-none focus:border-ct-subtle transition-colors duration-150"
            />
            {errors.email && <p className="text-xs text-ct-red mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-ct-muted mb-1.5">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="8+ characters"
                {...register('password', { required: 'Required', minLength: { value: 8, message: 'Min 8 characters' } })}
                className="w-full bg-ct-elevated border border-ct-border rounded-lg px-4 py-2.5 pr-10 text-sm text-ct-text placeholder:text-ct-subtle focus:outline-none focus:border-ct-subtle transition-colors duration-150"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ct-subtle hover:text-ct-muted cursor-pointer transition-colors duration-150"
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
            {isPending ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-ct-muted mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-ct-text font-medium hover:text-ct-red transition-colors duration-150 cursor-pointer">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
