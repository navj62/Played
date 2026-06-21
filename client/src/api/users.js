import api from './axios'

// avatar/cover uploads go through Cloudinary — allow more time than the default,
// but still time out eventually so a stuck request surfaces a clear error
const UPLOAD_TIMEOUT = 5 * 60 * 1000 // 5 minutes

export const register = (formData) =>
  api.post('/users/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: UPLOAD_TIMEOUT,
  }).then((r) => r.data.data)

export const login = (data) =>
  api.post('/users/login', data).then((r) => r.data.data)

export const logout = () =>
  api.post('/users/logout').then((r) => r.data)

export const getCurrentUser = () =>
  api.get('/users/current-user').then((r) => r.data.data)

export const getChannelProfile = (username) =>
  api.get(`/users/c/${username}`).then((r) => r.data.data)

export const getWatchHistory = () =>
  api.get('/users/history').then((r) => r.data.data)

export const updateAccount = (data) =>
  api.patch('/users/update-account', data).then((r) => r.data.data)

export const updateAvatar = (formData) =>
  api.patch('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: UPLOAD_TIMEOUT,
  }).then((r) => r.data.data)

export const changePassword = (data) =>
  api.post('/users/change-password', data).then((r) => r.data)
