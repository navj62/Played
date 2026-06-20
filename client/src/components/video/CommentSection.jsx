import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Send, Trash2, Pencil, X, Check } from 'lucide-react'
import { getVideoComments, addComment, updateComment, deleteComment } from '../../api/comments'
import Avatar from '../ui/Avatar'
import useAuthStore from '../../store/authStore'
import { formatTimeAgo } from '../../utils/formatters'
import { useNavigate } from 'react-router-dom'

function CommentItem({ comment, currentUser, videoId }) {
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(comment.content)
  const queryClient = useQueryClient()
  const isOwner = currentUser?._id === comment.owner?._id

  const updateMut = useMutation({
    mutationFn: () => updateComment(videoId, comment._id, editText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', videoId] })
      setEditing(false)
    },
  })

  const deleteMut = useMutation({
    mutationFn: () => deleteComment(comment._id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', videoId] }),
  })

  return (
    <div className="flex gap-3 group">
      <Avatar src={comment.owner?.avatar} alt={comment.owner?.fullName} size="sm" className="flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-ct-text text-xs font-semibold">{comment.owner?.fullName || comment.owner?.username}</span>
          <span className="text-ct-subtle text-[11px]">{formatTimeAgo(comment.createdAt)}</span>
        </div>
        {editing ? (
          <div className="flex gap-2">
            <input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="flex-1 bg-ct-elevated border border-ct-border rounded px-3 py-1.5 text-sm text-ct-text focus:outline-none focus:border-ct-subtle"
              autoFocus
            />
            <button
              onClick={() => updateMut.mutate()}
              disabled={updateMut.isPending || !editText.trim()}
              className="p-1.5 text-ct-red hover:text-red-400 cursor-pointer transition-colors duration-150"
              aria-label="Save"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => setEditing(false)}
              className="p-1.5 text-ct-subtle hover:text-ct-muted cursor-pointer transition-colors duration-150"
              aria-label="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <p className="text-ct-muted text-sm leading-relaxed">{comment.content}</p>
        )}
      </div>
      {isOwner && !editing && (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0">
          <button
            onClick={() => setEditing(true)}
            className="p-1.5 text-ct-subtle hover:text-ct-muted cursor-pointer transition-colors duration-150"
            aria-label="Edit comment"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => deleteMut.mutate()}
            disabled={deleteMut.isPending}
            className="p-1.5 text-ct-subtle hover:text-ct-red cursor-pointer transition-colors duration-150"
            aria-label="Delete comment"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

export default function CommentSection({ videoId }) {
  const [newComment, setNewComment] = useState('')
  const [focused, setFocused] = useState(false)
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', videoId],
    queryFn: () => getVideoComments(videoId),
    enabled: !!videoId,
  })

  const addMut = useMutation({
    mutationFn: () => addComment(videoId, newComment),
    onSuccess: () => {
      setNewComment('')
      setFocused(false)
      queryClient.invalidateQueries({ queryKey: ['comments', videoId] })
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!user) return navigate('/login')
    if (newComment.trim()) addMut.mutate()
  }

  const commentList = Array.isArray(comments) ? comments : comments?.comments || []

  return (
    <div className="mt-8">
      <h3 className="text-ct-text font-semibold mb-5">
        {commentList.length > 0 ? `${commentList.length} Comments` : 'Comments'}
      </h3>

      {/* Add comment */}
      <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
        <Avatar src={user?.avatar} alt={user?.fullName} size="sm" className="flex-shrink-0 mt-1" />
        <div className="flex-1">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder={user ? 'Add a comment...' : 'Sign in to comment'}
            readOnly={!user}
            onClick={() => !user && navigate('/login')}
            className="w-full bg-transparent border-b border-ct-border focus:border-ct-subtle outline-none pb-2 text-sm text-ct-text placeholder:text-ct-subtle transition-colors duration-150 cursor-text"
          />
          {focused && user && (
            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => { setFocused(false); setNewComment('') }}
                className="px-4 py-1.5 text-xs font-medium text-ct-muted hover:text-ct-text rounded-full hover:bg-ct-elevated cursor-pointer transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newComment.trim() || addMut.isPending}
                className="px-4 py-1.5 text-xs font-medium bg-ct-red hover:bg-red-700 text-white rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
              >
                <Send className="w-3 h-3 inline mr-1.5" />
                Post
              </button>
            </div>
          )}
        </div>
      </form>

      {/* Comment list */}
      {isLoading ? (
        <div className="space-y-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 rounded-full skeleton flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 skeleton rounded w-32" />
                <div className="h-3 skeleton rounded w-full" />
                <div className="h-3 skeleton rounded w-4/5" />
              </div>
            </div>
          ))}
        </div>
      ) : commentList.length === 0 ? (
        <p className="text-ct-subtle text-sm text-center py-8">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-6">
          {commentList.map((comment) => (
            <CommentItem key={comment._id} comment={comment} currentUser={user} videoId={videoId} />
          ))}
        </div>
      )}
    </div>
  )
}
