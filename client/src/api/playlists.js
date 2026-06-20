import api from './axios'

export const createPlaylist = (data) =>
  api.post('/playlists', data).then((r) => r.data.data)

export const getUserPlaylists = (userId) =>
  api.get(`/playlists/user/${userId}`).then((r) => r.data.data)

export const getPlaylist = (playlistId) =>
  api.get(`/playlists/${playlistId}`).then((r) => r.data.data)

export const addVideoToPlaylist = (playlistId, videoId) =>
  api.post(`/playlists/${playlistId}/${videoId}`).then((r) => r.data.data)

export const removeVideoFromPlaylist = (playlistId, videoId) =>
  api.delete(`/playlists/${playlistId}/${videoId}`).then((r) => r.data.data)

export const deletePlaylist = (playlistId) =>
  api.delete(`/playlists/${playlistId}`).then((r) => r.data)
