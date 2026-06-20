import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toggleSubscription } from '../../api/subscriptions'
import useAuthStore from '../../store/authStore'
import { useNavigate } from 'react-router-dom'

export default function SubscribeButton({ channelId, subscribed: initialSub, size = 'md' }) {
  const [subscribed, setSubscribed] = useState(initialSub)
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: () => toggleSubscription(channelId),
    onMutate: () => setSubscribed((prev) => !prev),
    onError: () => setSubscribed((prev) => !prev),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channel'] })
    },
  })

  const handleClick = () => {
    if (!user) return navigate('/login')
    if (!isPending) mutate()
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2 text-sm',
    lg: 'px-6 py-2.5 text-sm',
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`${sizes[size]} rounded-full font-semibold transition-colors duration-150 cursor-pointer ${
        subscribed
          ? 'bg-ct-elevated border border-ct-border text-ct-muted hover:border-ct-hover hover:text-ct-text'
          : 'bg-ct-red hover:bg-red-700 text-white'
      }`}
      aria-pressed={subscribed}
    >
      {subscribed ? 'Subscribed' : 'Subscribe'}
    </button>
  )
}
