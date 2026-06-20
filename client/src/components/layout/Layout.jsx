import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'

export default function Layout() {
  return (
    <div className="min-h-screen bg-ct-black">
      <Sidebar />
      <div className="lg:pl-56">
        <Navbar />
        <main className="pt-14 pb-16 lg:pb-0 min-h-screen">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
