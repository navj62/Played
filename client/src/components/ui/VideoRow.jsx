import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import VideoCard from './VideoCard'
import { SkeletonCard } from './SkeletonCard'

export default function VideoRow({ title, videos, loading, seeAllLink }) {
  const scrollRef = useRef(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const updateScroll = () => {
    const c = scrollRef.current
    if (!c) return
    setCanLeft(c.scrollLeft > 4)
    setCanRight(c.scrollLeft < c.scrollWidth - c.clientWidth - 4)
  }

  useEffect(() => {
    const c = scrollRef.current
    if (!c) return
    updateScroll()
    c.addEventListener('scroll', updateScroll, { passive: true })
    const ro = new ResizeObserver(updateScroll)
    ro.observe(c)
    return () => {
      c.removeEventListener('scroll', updateScroll)
      ro.disconnect()
    }
  }, [videos, loading])

  const scroll = (dir) => {
    const c = scrollRef.current
    if (!c) return
    c.scrollBy({ left: dir === 'right' ? c.clientWidth * 0.7 : -c.clientWidth * 0.7, behavior: 'smooth' })
  }

  return (
    <section className="mb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <span className="w-[3px] h-5 bg-ct-red rounded-full flex-shrink-0" />
          <h2 className="text-base font-bold text-ct-text tracking-tight">{title}</h2>
        </div>
        {seeAllLink && (
          <Link
            to={seeAllLink}
            className="text-xs text-ct-subtle hover:text-ct-red transition-colors duration-150 cursor-pointer flex-shrink-0"
          >
            See all
          </Link>
        )}
      </div>

      {/* Scroll wrapper */}
      <div className="relative group/row">
        {/* Left fade + chevron */}
        {canLeft && (
          <div className="absolute left-0 top-0 bottom-4 w-16 bg-gradient-to-r from-ct-black via-ct-black/80 to-transparent z-10 flex items-start pt-8 pointer-events-none">
            <button
              onClick={() => scroll('left')}
              className="ml-2 w-8 h-8 rounded-full bg-ct-elevated border border-ct-border flex items-center justify-center cursor-pointer pointer-events-auto opacity-0 group-hover/row:opacity-100 transition-opacity duration-150 hover:bg-ct-hover"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4 text-ct-text" />
            </button>
          </div>
        )}

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-none px-4 lg:px-6 pb-1"
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : videos?.map((video) => (
                <div key={video._id} className="w-64 xl:w-72 flex-shrink-0">
                  <VideoCard video={video} />
                </div>
              ))}
        </div>

        {/* Right fade + chevron */}
        {canRight && (
          <div className="absolute right-0 top-0 bottom-4 w-16 bg-gradient-to-l from-ct-black via-ct-black/80 to-transparent z-10 flex items-start pt-8 justify-end pointer-events-none">
            <button
              onClick={() => scroll('right')}
              className="mr-2 w-8 h-8 rounded-full bg-ct-elevated border border-ct-border flex items-center justify-center cursor-pointer pointer-events-auto opacity-0 group-hover/row:opacity-100 transition-opacity duration-150 hover:bg-ct-hover"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4 text-ct-text" />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
