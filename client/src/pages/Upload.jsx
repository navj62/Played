import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { UploadCloud, Film, ImagePlus, X } from 'lucide-react'
import { useState, useRef } from 'react'
import { uploadVideo } from '../api/videos'

// Keep in sync with the backend caps (src/middlewares/multer.js).
const MAX_VIDEO_BYTES = 4 * 1024 * 1024 // 4 MB
const MAX_THUMB_BYTES = 2 * 1024 * 1024 // 2 MB

export default function Upload() {
  const [videoPreview, setVideoPreview] = useState(null)
  const [thumbPreview, setThumbPreview] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const videoRef = useRef(null)
  const thumbRef = useRef(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { register, handleSubmit, formState: { errors }, setError, clearErrors } = useForm()

  const { ref: videoFormRef, onChange: onVideoChange, ...videoRest } = register('video', {
    required: 'Video file is required',
    validate: (files) =>
      !files?.[0] || files[0].size <= MAX_VIDEO_BYTES || 'Video must be 4MB or smaller',
  })
  const { ref: thumbFormRef, onChange: onThumbChange, ...thumbRest } = register('thumbnail', {
    required: 'Thumbnail is required',
    validate: (files) =>
      !files?.[0] || files[0].size <= MAX_THUMB_BYTES || 'Thumbnail must be 2MB or smaller',
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => {
      const fd = new FormData()
      fd.append('title', data.title)
      fd.append('description', data.description || '')
      fd.append('video', data.video[0])
      fd.append('thumbnail', data.thumbnail[0])
      return uploadVideo(fd, setUploadProgress)
    },
    onSuccess: (video) => {
      // Drop stale caches so the new video shows up immediately on the
      // feed, the dashboard and the channel page (staleTime is 5 min).
      queryClient.invalidateQueries({ queryKey: ['videos'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-videos'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      navigate(`/watch/${video._id}`)
    },
    onError: (err) => setError('root', { message: err.response?.data?.message || 'Upload failed' }),
  })

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ct-text">Upload video</h1>
        <p className="text-ct-muted text-sm mt-1">Share your work with the VideoTube community</p>
      </div>

      <form onSubmit={handleSubmit(mutate)} className="space-y-6" noValidate>
        {errors.root && (
          <div className="bg-ct-red-dim border border-ct-red/30 rounded-lg px-4 py-3 text-ct-red text-sm">
            {errors.root.message}
          </div>
        )}

        {/* Video file */}
        <div>
          <label className="block text-xs font-semibold text-ct-muted uppercase tracking-wider mb-2">
            Video file <span className="text-ct-red">*</span>
          </label>
          <div
            onClick={() => videoRef.current?.click()}
            className="border-2 border-dashed border-ct-border hover:border-ct-red rounded-lg p-8 text-center cursor-pointer transition-colors duration-150 group"
          >
            {videoPreview ? (
              <div className="relative">
                <video src={videoPreview} className="max-h-40 mx-auto rounded" />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setVideoPreview(null) }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-ct-elevated border border-ct-border rounded-full flex items-center justify-center cursor-pointer hover:bg-ct-hover transition-colors duration-150"
                >
                  <X className="w-3 h-3 text-ct-muted" />
                </button>
              </div>
            ) : (
              <>
                <Film className="w-10 h-10 text-ct-subtle group-hover:text-ct-red transition-colors duration-150 mx-auto mb-3" />
                <p className="text-ct-muted text-sm">Click to select a video</p>
                <p className="text-ct-subtle text-xs mt-1">MP4, MOV — max 4MB</p>
              </>
            )}
          </div>
          <input
            {...videoRest}
            ref={(e) => { videoFormRef(e); videoRef.current = e }}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              onVideoChange(e)
              const file = e.target.files?.[0]
              if (!file) return
              if (file.size > MAX_VIDEO_BYTES) {
                setError('video', { type: 'manual', message: 'Video must be 4MB or smaller' })
                setVideoPreview(null)
                return
              }
              clearErrors('video')
              setVideoPreview(URL.createObjectURL(file))
            }}
          />
          {errors.video && <p className="text-xs text-ct-red mt-1">{errors.video.message}</p>}
        </div>

        {/* Thumbnail */}
        <div>
          <label className="block text-xs font-semibold text-ct-muted uppercase tracking-wider mb-2">
            Thumbnail <span className="text-ct-red">*</span>
          </label>
          <div
            onClick={() => thumbRef.current?.click()}
            className="border-2 border-dashed border-ct-border hover:border-ct-red rounded-lg overflow-hidden cursor-pointer transition-colors duration-150 group"
          >
            {thumbPreview ? (
              <div className="relative aspect-video">
                <img src={thumbPreview} alt="Thumbnail preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setThumbPreview(null) }}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center cursor-pointer"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ) : (
              <div className="aspect-video flex flex-col items-center justify-center">
                <ImagePlus className="w-8 h-8 text-ct-subtle group-hover:text-ct-red transition-colors duration-150 mb-2" />
                <p className="text-ct-muted text-sm">Select thumbnail image</p>
                <p className="text-ct-subtle text-xs mt-1">JPG, PNG — max 2MB</p>
              </div>
            )}
          </div>
          <input
            {...thumbRest}
            ref={(e) => { thumbFormRef(e); thumbRef.current = e }}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              onThumbChange(e)
              const file = e.target.files?.[0]
              if (!file) return
              if (file.size > MAX_THUMB_BYTES) {
                setError('thumbnail', { type: 'manual', message: 'Thumbnail must be 2MB or smaller' })
                setThumbPreview(null)
                return
              }
              clearErrors('thumbnail')
              setThumbPreview(URL.createObjectURL(file))
            }}
          />
          {errors.thumbnail && <p className="text-xs text-ct-red mt-1">{errors.thumbnail.message}</p>}
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-xs font-semibold text-ct-muted uppercase tracking-wider mb-2">
            Title <span className="text-ct-red">*</span>
          </label>
          <input
            id="title"
            type="text"
            placeholder="Give your video a great title"
            {...register('title', { required: 'Title is required', maxLength: { value: 100, message: 'Max 100 characters' } })}
            className="w-full bg-ct-elevated border border-ct-border rounded-lg px-4 py-2.5 text-sm text-ct-text placeholder:text-ct-subtle focus:outline-none focus:border-ct-subtle transition-colors duration-150"
          />
          {errors.title && <p className="text-xs text-ct-red mt-1">{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-xs font-semibold text-ct-muted uppercase tracking-wider mb-2">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            placeholder="Tell viewers about your video..."
            {...register('description')}
            className="w-full bg-ct-elevated border border-ct-border rounded-lg px-4 py-2.5 text-sm text-ct-text placeholder:text-ct-subtle focus:outline-none focus:border-ct-subtle transition-colors duration-150 resize-none"
          />
        </div>

        {/* Progress */}
        {isPending && uploadProgress > 0 && (
          <div>
            <div className="flex justify-between text-xs text-ct-muted mb-1.5">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-1 bg-ct-elevated rounded-full overflow-hidden">
              <div
                className="h-full bg-ct-red rounded-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 rounded-lg text-sm font-medium border border-ct-border text-ct-muted hover:text-ct-text hover:border-ct-hover cursor-pointer transition-colors duration-150"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 bg-ct-red hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition-colors duration-150 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            {isPending ? `Uploading ${uploadProgress}%...` : 'Publish video'}
          </button>
        </div>
      </form>
    </div>
  )
}
