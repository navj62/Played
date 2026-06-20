import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      updateUser: (partial) => set((s) => ({ user: s.user ? { ...s.user, ...partial } : null })),
      logout: () => set({ user: null }),
    }),
    {
      name: 'vt-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
)

export default useAuthStore
