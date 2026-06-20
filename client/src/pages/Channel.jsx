import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getChannelProfile } from '../api/users'
import { getVideos } from '../api/videos'
import Avatar from '../components/ui/Avatar'
import SubscribeButton from '../components/video/SubscribeButton'
import VideoCard from '../components/ui/VideoCard'
import { SkeletonCard } from '../components/ui/SkeletonCard'
import EmptyState from '../components/ui/EmptyState'
import { formatCount } from '../utils/formatters'
import { PlaySquare } from 'lucide-react'

export default function Channel() {
  const { username } = useParams()

  const { data: channel, isLoading: channelLoading } = useQuery({
    queryKey: ['channel', username],
    queryFn: () => getChannelProfile(username),
    enabled: !!username,
  })

  const { data: videos, isLoading: videosLoading } = useQuery({
    queryKey: ['videos', 'channel', channel?._id],
    queryFn: () => getVideos({ userId: channel._id, limit: 20 }),
    enabled: !!channel?._id,
  })

  const videoList = Array.isArray(videos) ? videos : videos?.videos || []

  if (channelLoading) {
    return (
      <div>
        <div className="h-36 lg:h-52 bg-ct-elevated skeleton" />
        <div className="px-4 lg:px-8 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 mb-8">
            <div className="w-24 h-24 rounded-full skeleton border-4 border-ct-black flex-shrink-0" />
            <div className="flex-1 space-y-2 pb-1">
              <div className="h-5 skeleton rounded w-48" />
              <div className="h-3.5 skeleton rounded w-32" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!channel) {
    return (
      <EmptyState
        icon={PlaySquare}
        title="Channel not found"
        description="This channel doesn't exist or has been removed."
      />
    )
  }

  return (
    <div>
      {/* Cover image */}
      <div className="h-36 lg:h-52 bg-ct-elevated overflow-hidden">
        {channel.coverImage ? (
          <img src={channel.coverImage} alt="Channel cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-ct-elevated to-ct-surface" />
        )}
      </div>

      <div className="px-4 lg:px-8 pb-8">
        {/* Channel header */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 mb-6 sm:mb-8">
          <Avatar
            src={channel.avatar}
            alt={channel.fullName}
            size="xl"
            className="border-4 border-ct-black flex-shrink-0"
          />
          <div className="flex-1 min-w-0 sm:pb-1">
            <h1 className="text-ct-text font-bold text-2xl leading-tight">{channel.fullName}</h1>
            <p className="text-ct-muted text-sm mt-1">@{channel.username}</p>
            <p className="text-ct-subtle text-sm mt-0.5">
              {formatCount(channel.subscribersCount || 0)} subscribers
              {channel.channelsSubscribedToCount != null && (
                <> · {formatCount(channel.channelsSubscribedToCount)} subscribed</>
              )}
            </p>
          </div>
          {channel._id && (
            <div className="flex-shrink-0 sm:pb-1">
              <SubscribeButton channelId={channel._id} subscribed={channel.isSubscribed} size="lg" />
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-b border-ct-border mb-8" />

        {/* Videos */}
        <h2 className="text-ct-text font-semibold mb-5 flex items-center gap-2">
          <span className="w-[3px] h-4 bg-ct-red rounded-full inline-block" />
          Videos
        </h2>

        {videosLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : videoList.length === 0 ? (
          <EmptyState
            icon={PlaySquare}
            title="No videos yet"
            description="This channel hasn't uploaded any videos."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
            {videoList.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
