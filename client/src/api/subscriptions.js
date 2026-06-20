import api from './axios'

export const toggleSubscription = (channelId) =>
  api.post(`/subscriptions/c/${channelId}`).then((r) => r.data.data)

export const getChannelSubscribers = (channelId) =>
  api.get(`/subscriptions/c/${channelId}`).then((r) => r.data.data)

export const getSubscribedChannels = (userId) =>
  api.get(`/subscriptions/u/${userId}`).then((r) => r.data.data)
