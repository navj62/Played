import api from './axios'

export const register = (formData) =>
  api.post('/users/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
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
  }).then((r) => r.data.data)

export const changePassword = (data) =>
  api.post('/users/change-password', data).then((r) => r.data)
