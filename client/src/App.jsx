import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Home from './pages/Home'
import Watch from './pages/Watch'
import Channel from './pages/Channel'
import Login from './pages/Login'
import Register from './pages/Register'
import Upload from './pages/Upload'
import LikedVideos from './pages/LikedVideos'
import History from './pages/History'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="watch/:videoId" element={<Watch />} />
        <Route path="channel/:username" element={<Channel />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="upload" element={<Upload />} />
          <Route path="liked" element={<LikedVideos />} />
          <Route path="history" element={<History />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>
    </Routes>
  )
}
