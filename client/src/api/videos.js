import api from './axios'

export const getVideos = (params) =>
  api.get('/videos', { params }).then((r) => r.data.data)

export const getVideoById = (id) =>
  api.get(`/videos/${id}`).then((r) => r.data.data)

// uploads + Cloudinary processing can far exceed the default timeout, but a
// genuinely stuck request should still fail eventually rather than hang forever
const UPLOAD_TIMEOUT = 5 * 60 * 1000 // 5 minutes

export const uploadVideo = (formData, onProgress) =>
  api.post('/videos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: UPLOAD_TIMEOUT,
    onUploadProgress: (e) => onProgress?.(Math.round((e.loaded * 100) / e.total)),
  }).then((r) => r.data.data)

export const updateVideo = (id, data) =>
  api.patch(`/videos/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: UPLOAD_TIMEOUT,
  }).then((r) => r.data.data)

export const deleteVideo = (id) =>
  api.delete(`/videos/${id}`).then((r) => r.data)

export const togglePublish = (id) =>
  api.patch(`/videos/toggle/publish/${id}`).then((r) => r.data.data)
