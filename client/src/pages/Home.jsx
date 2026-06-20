import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { getVideos } from '../api/videos'
import VideoRow from '../components/ui/VideoRow'
import VideoCard from '../components/ui/VideoCard'
import { SkeletonRow } from '../components/ui/SkeletonCard'
import EmptyState from '../components/ui/EmptyState'

export default function Home() {
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('q') || ''

  const isSearching = !!searchQuery

  const { data: trending, isLoading: trendingLoading } = useQuery({
    queryKey: ['videos', 'trending'],
    queryFn: () => getVideos({ sortBy: 'views', sortType: 'desc', limit: 12 }),
    enabled: !isSearching,
  })

  const { data: recent, isLoading: recentLoading } = useQuery({
    queryKey: ['videos', 'recent'],
    queryFn: () => getVideos({ sortBy: 'createdAt', sortType: 'desc', limit: 12 }),
    enabled: !isSearching,
  })

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['videos', 'search', searchQuery],
    queryFn: () => getVideos({ query: searchQuery, limit: 24 }),
    enabled: isSearching,
  })

  const trendingVideos = Array.isArray(trending) ? trending : trending?.videos || []
  const recentVideos = Array.isArray(recent) ? recent : recent?.videos || []
  const searchVideos = Array.isArray(searchResults) ? searchResults : searchResults?.videos || []

  if (isSearching) {
    return (
      <div className="px-4 lg:px-6 py-6">
        <p className="text-ct-muted text-sm mb-6">
          Search results for <span className="text-ct-text font-medium">"{searchQuery}"</span>
        </p>

        {searchLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i}>
                <div className="aspect-video skeleton rounded-sm" />
                <div className="flex gap-3 mt-3">
                  <div className="w-8 h-8 rounded-full skeleton flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 skeleton rounded" />
                    <div className="h-3 skeleton rounded w-3/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : searchVideos.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No results found"
            description={`We couldn't find any videos for "${searchQuery}". Try different keywords.`}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
            {searchVideos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="py-6">
      {/* Rows */}
      {trendingLoading ? (
        <>
          <SkeletonRow />
          <SkeletonRow />
        </>
      ) : (
        <>
          {trendingVideos.length > 0 && (
            <VideoRow
              title="Trending Now"
              videos={trendingVideos}
              loading={trendingLoading}
            />
          )}
          {recentVideos.length > 0 && (
            <VideoRow
              title="Recently Added"
              videos={recentVideos}
              loading={recentLoading}
            />
          )}
          {trendingVideos.length === 0 && recentVideos.length === 0 && !trendingLoading && !recentLoading && (
            <EmptyState
              icon={Search}
              title="No videos yet"
              description="Be the first to upload a video on VideoTube."
            />
          )}
        </>
      )}
    </div>
  )
}
