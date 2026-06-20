import api from './axios'

export const toggleVideoLike = (videoId) =>
  api.post(`/likes/toggle/v/${videoId}`).then((r) => r.data.data)

export const toggleCommentLike = (commentId) =>
  api.post(`/likes/toggle/c/${commentId}`).then((r) => r.data.data)

export const toggleTweetLike = (tweetId) =>
  api.post(`/likes/toggle/t/${tweetId}`).then((r) => r.data.data)

export const getLikedVideos = () =>
  api.get('/likes/videos').then((r) => r.data.data)
