import { useQuery } from '@tanstack/react-query'
import { History as HistoryIcon } from 'lucide-react'
import { getWatchHistory } from '../api/users'
import VideoCard from '../components/ui/VideoCard'
import { SkeletonCard } from '../components/ui/SkeletonCard'
import EmptyState from '../components/ui/EmptyState'
import { Link } from 'react-router-dom'

export default function History() {
  const { data, isLoading } = useQuery({
    queryKey: ['watch-history'],
    queryFn: getWatchHistory,
  })

  const videos = Array.isArray(data) ? data : []

  return (
    <div className="px-4 lg:px-6 py-6 max-w-screen-xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <span className="w-[3px] h-6 bg-ct-red rounded-full" />
        <h1 className="text-xl font-bold text-ct-text">Watch History</h1>
        {videos.length > 0 && (
          <span className="text-ct-muted text-sm">{videos.length} video{videos.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : videos.length === 0 ? (
        <EmptyState
          icon={HistoryIcon}
          title="No watch history"
          description="Videos you watch will appear here."
          action={
            <Link to="/" className="px-5 py-2 bg-ct-red hover:bg-red-700 text-white text-sm font-medium rounded-full cursor-pointer transition-colors duration-150">
              Start watching
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  )
}
