import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Share2, ChevronDown, ChevronUp } from 'lucide-react'
import { getVideoById, getVideos } from '../api/videos'
import { SkeletonVideoPage } from '../components/ui/SkeletonCard'
import Avatar from '../components/ui/Avatar'
import LikeButton from '../components/video/LikeButton'
import SubscribeButton from '../components/video/SubscribeButton'
import CommentSection from '../components/video/CommentSection'
import VideoCard from '../components/ui/VideoCard'
import { formatViews, formatDate } from '../utils/formatters'

export default function Watch() {
  const { videoId } = useParams()
  const [descExpanded, setDescExpanded] = useState(false)

  const { data: video, isLoading } = useQuery({
    queryKey: ['video', videoId],
    queryFn: () => getVideoById(videoId),
    enabled: !!videoId,
  })

  const { data: related } = useQuery({
    queryKey: ['videos', 'related'],
    queryFn: () => getVideos({ limit: 15, sortBy: 'views', sortType: 'desc' }),
  })

  const relatedVideos = Array.isArray(related) ? related : related?.videos || []

  if (isLoading) return <SkeletonVideoPage />

  if (!video) {
    return (
      <div className="flex items-center justify-center py-32 text-ct-muted text-sm">
        Video not found.
      </div>
    )
  }

  const owner = video.owner || {}
  const filteredRelated = relatedVideos.filter((v) => v._id !== videoId)

  return (
    <div className="px-4 lg:px-6 py-5 max-w-screen-2xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main column */}
        <div className="flex-1 min-w-0">
          {/* Video player */}
          <div className="aspect-video bg-black rounded-sm overflow-hidden">
            {video.videoFile ? (
              <video
                src={video.videoFile}
                controls
                autoPlay
                className="w-full h-full"
                preload="metadata"
                aria-label={video.title}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-ct-subtle text-sm">
                Video unavailable
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-ct-text font-bold text-lg mt-4 leading-snug">{video.title}</h1>

          {/* Channel row + actions */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-4 pb-4 border-b border-ct-border">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Link to={`/channel/${owner.username}`} className="cursor-pointer flex-shrink-0">
                <Avatar src={owner.avatar} alt={owner.fullName} size="md" />
              </Link>
              <div className="min-w-0">
                <Link to={`/channel/${owner.username}`}>
                  <p className="text-ct-text font-semibold text-sm truncate hover:text-ct-muted transition-colors duration-150 cursor-pointer">
                    {owner.fullName || owner.username}
                  </p>
                </Link>
                <p className="text-ct-subtle text-xs">{formatViews(video.views)}</p>
              </div>
              {owner._id && (
                <div className="ml-2 flex-shrink-0">
                  <SubscribeButton channelId={owner._id} subscribed={video.isSubscribed} />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <LikeButton videoId={videoId} liked={video.isLiked} likeCount={video.likeCount} />
              <button className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-ct-elevated border border-ct-border text-ct-muted hover:text-ct-text hover:border-ct-hover cursor-pointer transition-colors duration-150">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="mt-4 bg-ct-surface rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2 text-ct-subtle text-xs">
              <span>{formatViews(video.views)}</span>
              {video.createdAt && <span>{formatDate(video.createdAt)}</span>}
            </div>
            <div className={`text-ct-muted text-sm leading-relaxed ${!descExpanded ? 'line-clamp-3' : ''}`}>
              {video.description || 'No description provided.'}
            </div>
            {video.description && video.description.length > 120 && (
              <button
                onClick={() => setDescExpanded((v) => !v)}
                className="mt-2 text-ct-text text-xs font-semibold flex items-center gap-1 cursor-pointer hover:text-ct-muted transition-colors duration-150"
              >
                {descExpanded ? <><ChevronUp className="w-3.5 h-3.5" /> Show less</> : <><ChevronDown className="w-3.5 h-3.5" /> Show more</>}
              </button>
            )}
          </div>

          <CommentSection videoId={videoId} />
        </div>

        {/* Related sidebar */}
        <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0">
          <h2 className="text-ct-text font-semibold text-sm mb-4 hidden lg:block">Up next</h2>
          <div className="space-y-3">
            {filteredRelated.slice(0, 12).map((v) => (
              <VideoCard key={v._id} video={v} layout="row" />
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
