import api from './axios'

export const getVideoComments = (videoId, params) =>
  api.get(`/comments/${videoId}`, { params }).then((r) => r.data.data)

export const addComment = (videoId, content) =>
  api.post(`/comments/${videoId}`, { content }).then((r) => r.data.data)

export const updateComment = (videoId, commentId, content) =>
  api.patch(`/comments/${videoId}/${commentId}`, { content }).then((r) => r.data.data)

export const deleteComment = (commentId) =>
  api.delete(`/comments/${commentId}`).then((r) => r.data)
