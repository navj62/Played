import { useState } from 'react'
import { ThumbsUp } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toggleVideoLike } from '../../api/likes'
import { formatCount } from '../../utils/formatters'
import useAuthStore from '../../store/authStore'
import { useNavigate } from 'react-router-dom'

export default function LikeButton({ videoId, liked: initialLiked, likeCount: initialCount }) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount || 0)
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: () => toggleVideoLike(videoId),
    onMutate: () => {
      setLiked((prev) => !prev)
      setCount((prev) => (liked ? prev - 1 : prev + 1))
    },
    onError: () => {
      setLiked((prev) => !prev)
      setCount((prev) => (liked ? prev + 1 : prev - 1))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video', videoId] })
    },
  })

  const handleClick = () => {
    if (!user) return navigate('/login')
    if (!isPending) mutate()
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-150 cursor-pointer border ${
        liked
          ? 'bg-ct-red-dim border-ct-red text-ct-red'
          : 'bg-ct-elevated border-ct-border text-ct-muted hover:text-ct-text hover:border-ct-hover'
      }`}
      aria-label={liked ? 'Unlike video' : 'Like video'}
      aria-pressed={liked}
    >
      <ThumbsUp className={`w-4 h-4 ${liked ? 'fill-ct-red' : ''}`} />
      <span>{formatCount(count)}</span>
    </button>
  )
}
