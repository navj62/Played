import { Link } from 'react-router-dom'
import { Play } from 'lucide-react'
import Avatar from './Avatar'
import { formatDuration, formatViews, formatTimeAgo } from '../../utils/formatters'

export default function VideoCard({ video, layout = 'grid' }) {
  if (!video) return null

  const owner = video.owner || {}

  if (layout === 'row') {
    return (
      <div className="flex gap-3 group cursor-pointer">
        <Link to={`/watch/${video._id}`} className="relative flex-shrink-0 w-40 aspect-video bg-ct-elevated rounded-sm overflow-hidden">
          {video.thumbnail ? (
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.04]"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play className="w-6 h-6 text-ct-subtle" />
            </div>
          )}
          {video.duration != null && (
            <span className="absolute bottom-1 right-1 bg-black/90 text-white text-[10px] font-medium px-1 py-0.5 rounded leading-none">
              {formatDuration(video.duration)}
            </span>
          )}
        </Link>
        <div className="flex-1 min-w-0 py-0.5">
          <Link to={`/watch/${video._id}`}>
            <h4 className="text-ct-text text-sm font-medium line-clamp-2 leading-snug hover:text-ct-muted transition-colors duration-150">
              {video.title}
            </h4>
          </Link>
          <Link to={`/channel/${owner.username}`} className="text-ct-subtle text-xs mt-1 hover:text-ct-muted transition-colors duration-150 block">
            {owner.fullName || owner.username}
          </Link>
          <p className="text-ct-subtle text-xs mt-0.5">
            {formatViews(video.views)}{video.createdAt ? ` · ${formatTimeAgo(video.createdAt)}` : ''}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="group cursor-pointer w-full">
      {/* Thumbnail */}
      <Link to={`/watch/${video._id}`}>
        <div className="relative aspect-video bg-ct-elevated rounded-sm overflow-hidden">
          {video.thumbnail ? (
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play className="w-8 h-8 text-ct-subtle" />
            </div>
          )}

          {/* Duration */}
          {video.duration != null && (
            <span className="absolute bottom-1.5 right-1.5 bg-black/90 text-white text-[11px] font-medium px-1.5 py-0.5 rounded leading-none">
              {formatDuration(video.duration)}
            </span>
          )}

          {/* Hover play overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
          </div>
        </div>
      </Link>

      {/* Meta */}
      <div className="flex gap-3 mt-3">
        <Link to={`/channel/${owner.username}`} className="flex-shrink-0 mt-0.5 cursor-pointer">
          <Avatar src={owner.avatar} alt={owner.fullName || owner.username} size="sm" />
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={`/watch/${video._id}`}>
            <h3 className="text-ct-text text-[13px] font-medium line-clamp-2 leading-snug hover:text-ct-muted transition-colors duration-150">
              {video.title}
            </h3>
          </Link>
          <Link
            to={`/channel/${owner.username}`}
            className="text-ct-muted text-xs mt-1 hover:text-ct-text transition-colors duration-150 block"
          >
            {owner.fullName || owner.username}
          </Link>
          <p className="text-ct-subtle text-[11px] mt-0.5">
            {formatViews(video.views)}{video.createdAt ? ` · ${formatTimeAgo(video.createdAt)}` : ''}
          </p>
        </div>
      </div>
    </div>
  )
}
