import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Eye, Users, PlaySquare, Heart, Trash2, ToggleLeft, ToggleRight, BarChart2 } from 'lucide-react'
import { getChannelStats, getChannelVideos } from '../api/dashboard'
import { deleteVideo, togglePublish } from '../api/videos'
import { formatCount, formatViews, formatTimeAgo } from '../utils/formatters'
import EmptyState from '../components/ui/EmptyState'
import { Link } from 'react-router-dom'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-ct-surface border border-ct-border rounded-lg p-5">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-ct-subtle text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
      <p className="text-ct-text text-2xl font-bold">{value ?? '—'}</p>
    </div>
  )
}

export default function Dashboard() {
  const queryClient = useQueryClient()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getChannelStats,
  })

  const { data: videos, isLoading: videosLoading } = useQuery({
    queryKey: ['dashboard-videos'],
    queryFn: getChannelVideos,
  })

  const deleteMut = useMutation({
    mutationFn: deleteVideo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dashboard-videos'] }),
  })

  const publishMut = useMutation({
    mutationFn: togglePublish,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dashboard-videos'] }),
  })

  const videoList = Array.isArray(videos) ? videos : videos?.videos || []

  return (
    <div className="px-4 lg:px-6 py-6 max-w-screen-xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <span className="w-[3px] h-6 bg-ct-red rounded-full" />
        <h1 className="text-xl font-bold text-ct-text">Channel Dashboard</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-ct-surface border border-ct-border rounded-lg p-5">
              <div className="w-10 h-10 skeleton rounded-lg mb-4" />
              <div className="h-3 skeleton rounded w-20 mb-2" />
              <div className="h-6 skeleton rounded w-16" />
            </div>
          ))
        ) : (
          <>
            <StatCard icon={Eye} label="Total Views" value={formatCount(stats?.totalViews)} color="bg-blue-600" />
            <StatCard icon={Users} label="Subscribers" value={formatCount(stats?.totalSubscribers)} color="bg-ct-red" />
            <StatCard icon={PlaySquare} label="Videos" value={formatCount(stats?.totalVideos)} color="bg-emerald-600" />
            <StatCard icon={Heart} label="Total Likes" value={formatCount(stats?.totalLikes)} color="bg-pink-600" />
          </>
        )}
      </div>

      {/* Videos table */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-ct-text font-semibold flex items-center gap-2">
            <span className="w-[3px] h-4 bg-ct-red rounded-full" />
            Your Videos
          </h2>
          <Link
            to="/upload"
            className="px-4 py-1.5 bg-ct-red hover:bg-red-700 text-white text-xs font-medium rounded-full cursor-pointer transition-colors duration-150"
          >
            + Upload
          </Link>
        </div>

        {videosLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-ct-surface border border-ct-border rounded-lg p-4 flex gap-4">
                <div className="w-24 aspect-video skeleton rounded flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 skeleton rounded w-3/4" />
                  <div className="h-3 skeleton rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : videoList.length === 0 ? (
          <EmptyState
            icon={BarChart2}
            title="No videos yet"
            description="Upload your first video to see it here."
          />
        ) : (
          <div className="bg-ct-surface border border-ct-border rounded-lg overflow-hidden">
            <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-3 border-b border-ct-border text-[11px] font-semibold text-ct-subtle uppercase tracking-wider">
              <span>Video</span>
              <span className="text-right">Views</span>
              <span className="text-right">Date</span>
              <span className="text-right">Status</span>
              <span className="text-right">Actions</span>
            </div>
            <div className="divide-y divide-ct-border">
              {videoList.map((video) => (
                <div key={video._id} className="flex sm:grid sm:grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-4 items-center">
                  <div className="flex gap-3 items-center min-w-0">
                    {video.thumbnail && (
                      <img src={video.thumbnail} alt="" className="w-20 aspect-video object-cover rounded flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <Link to={`/watch/${video._id}`} className="text-ct-text text-sm font-medium line-clamp-2 hover:text-ct-muted transition-colors duration-150 cursor-pointer">
                        {video.title}
                      </Link>
                    </div>
                  </div>
                  <span className="text-ct-muted text-sm text-right hidden sm:block">{formatCount(video.views)}</span>
                  <span className="text-ct-subtle text-xs text-right hidden sm:block">{formatTimeAgo(video.createdAt)}</span>
                  <div className="text-right hidden sm:block">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${video.isPublished ? 'bg-emerald-900/40 text-emerald-400' : 'bg-ct-elevated text-ct-subtle'}`}>
                      {video.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => publishMut.mutate(video._id)}
                      disabled={publishMut.isPending}
                      className="text-ct-subtle hover:text-ct-muted cursor-pointer transition-colors duration-150"
                      aria-label={video.isPublished ? 'Unpublish' : 'Publish'}
                    >
                      {video.isPublished ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this video?')) deleteMut.mutate(video._id)
                      }}
                      disabled={deleteMut.isPending}
                      className="text-ct-subtle hover:text-ct-red cursor-pointer transition-colors duration-150"
                      aria-label="Delete video"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
