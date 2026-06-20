import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { useState, useRef } from 'react'
import { Camera, Check, Eye, EyeOff } from 'lucide-react'
import { updateAccount, updateAvatar, changePassword } from '../api/users'
import useAuthStore from '../store/authStore'
import Avatar from '../components/ui/Avatar'

function Section({ title, children }) {
  return (
    <div className="bg-ct-surface border border-ct-border rounded-lg overflow-hidden mb-6">
      <div className="px-5 py-4 border-b border-ct-border">
        <h2 className="text-ct-text font-semibold text-sm">{title}</h2>
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  )
}

function Toast({ message }) {
  return (
    <div className="fixed bottom-6 right-6 bg-ct-elevated border border-ct-border rounded-lg px-4 py-3 flex items-center gap-2 text-sm text-ct-text shadow-2xl z-50 animate-in">
      <Check className="w-4 h-4 text-emerald-400" />
      {message}
    </div>
  )
}

export default function Settings() {
  const { user, updateUser } = useAuthStore()
  const [toast, setToast] = useState(null)
  const [showPw, setShowPw] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const avatarInputRef = useRef(null)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const { register: regAccount, handleSubmit: handleAccount, formState: { errors: accountErrors } } = useForm({
    defaultValues: { fullName: user?.fullName || '', email: user?.email || '' },
  })

  const { register: regPw, handleSubmit: handlePw, formState: { errors: pwErrors }, reset: resetPw, setError: setPwError } = useForm()

  const accountMut = useMutation({
    mutationFn: updateAccount,
    onSuccess: (data) => { updateUser(data); showToast('Account updated') },
  })

  const avatarMut = useMutation({
    mutationFn: (fd) => updateAvatar(fd),
    onSuccess: (data) => { updateUser({ avatar: data.avatar }); showToast('Avatar updated') },
  })

  const pwMut = useMutation({
    mutationFn: changePassword,
    onSuccess: () => { resetPw(); showToast('Password changed') },
    onError: (err) => setPwError('root', { message: err.response?.data?.message || 'Failed to change password' }),
  })

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarPreview(URL.createObjectURL(file))
    const fd = new FormData()
    fd.append('avatar', file)
    avatarMut.mutate(fd)
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ct-text">Settings</h1>
        <p className="text-ct-muted text-sm mt-1">Manage your account</p>
      </div>

      {/* Avatar */}
      <Section title="Profile photo">
        <div className="flex items-center gap-5">
          <div className="relative flex-shrink-0">
            <Avatar src={avatarPreview || user?.avatar} alt={user?.fullName} size="xl" />
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-ct-red hover:bg-red-700 rounded-full flex items-center justify-center cursor-pointer transition-colors duration-150"
              aria-label="Change avatar"
            >
              <Camera className="w-4 h-4 text-white" />
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <p className="text-ct-text font-medium text-sm">{user?.fullName}</p>
            <p className="text-ct-muted text-xs mt-0.5">@{user?.username}</p>
            {avatarMut.isPending && <p className="text-ct-subtle text-xs mt-1">Uploading...</p>}
          </div>
        </div>
      </Section>

      {/* Account info */}
      <Section title="Account info">
        <form onSubmit={handleAccount((data) => accountMut.mutate(data))} className="space-y-4" noValidate>
          <div>
            <label htmlFor="fullName" className="block text-xs font-medium text-ct-muted mb-1.5">Full name</label>
            <input
              id="fullName"
              type="text"
              {...regAccount('fullName', { required: 'Required' })}
              className="w-full bg-ct-elevated border border-ct-border rounded-lg px-4 py-2.5 text-sm text-ct-text focus:outline-none focus:border-ct-subtle transition-colors duration-150"
            />
            {accountErrors.fullName && <p className="text-xs text-ct-red mt-1">{accountErrors.fullName.message}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-ct-muted mb-1.5">Email</label>
            <input
              id="email"
              type="email"
              {...regAccount('email', { required: 'Required' })}
              className="w-full bg-ct-elevated border border-ct-border rounded-lg px-4 py-2.5 text-sm text-ct-text focus:outline-none focus:border-ct-subtle transition-colors duration-150"
            />
            {accountErrors.email && <p className="text-xs text-ct-red mt-1">{accountErrors.email.message}</p>}
          </div>
          <button
            type="submit"
            disabled={accountMut.isPending}
            className="px-5 py-2 bg-ct-red hover:bg-red-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors duration-150"
          >
            {accountMut.isPending ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </Section>

      {/* Change password */}
      <Section title="Change password">
        <form onSubmit={handlePw((data) => pwMut.mutate(data))} className="space-y-4" noValidate>
          {pwErrors.root && (
            <div className="bg-ct-red-dim border border-ct-red/30 rounded-lg px-4 py-3 text-ct-red text-sm">
              {pwErrors.root.message}
            </div>
          )}
          <div>
            <label htmlFor="oldPassword" className="block text-xs font-medium text-ct-muted mb-1.5">Current password</label>
            <div className="relative">
              <input
                id="oldPassword"
                type={showPw ? 'text' : 'password'}
                {...regPw('oldPassword', { required: 'Required' })}
                className="w-full bg-ct-elevated border border-ct-border rounded-lg px-4 py-2.5 pr-10 text-sm text-ct-text focus:outline-none focus:border-ct-subtle transition-colors duration-150"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ct-subtle hover:text-ct-muted cursor-pointer transition-colors duration-150"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {pwErrors.oldPassword && <p className="text-xs text-ct-red mt-1">{pwErrors.oldPassword.message}</p>}
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-xs font-medium text-ct-muted mb-1.5">New password</label>
            <input
              id="newPassword"
              type={showPw ? 'text' : 'password'}
              {...regPw('newPassword', { required: 'Required', minLength: { value: 8, message: 'Min 8 characters' } })}
              className="w-full bg-ct-elevated border border-ct-border rounded-lg px-4 py-2.5 text-sm text-ct-text focus:outline-none focus:border-ct-subtle transition-colors duration-150"
            />
            {pwErrors.newPassword && <p className="text-xs text-ct-red mt-1">{pwErrors.newPassword.message}</p>}
          </div>
          <button
            type="submit"
            disabled={pwMut.isPending}
            className="px-5 py-2 bg-ct-elevated hover:bg-ct-hover border border-ct-border disabled:opacity-60 text-ct-text text-sm font-medium rounded-lg cursor-pointer transition-colors duration-150"
          >
            {pwMut.isPending ? 'Changing...' : 'Change password'}
          </button>
        </form>
      </Section>

      {toast && <Toast message={toast} />}
    </div>
  )
}
