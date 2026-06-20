import api from './axios'

export const getChannelStats = () =>
  api.get('/dashboard/stats').then((r) => r.data.data)

export const getChannelVideos = () =>
  api.get('/dashboard/videos').then((r) => r.data.data)
