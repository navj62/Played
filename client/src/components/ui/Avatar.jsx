export default function Avatar({ src, alt, size = 'md', className = '' }) {
  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
  }

  const initials = alt
    ?.split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      className={`rounded-full overflow-hidden flex-shrink-0 bg-ct-elevated flex items-center justify-center font-semibold text-ct-muted ${sizes[size]} ${className}`}
    >
      {src ? (
        <img src={src} alt={alt || ''} className="w-full h-full object-cover" loading="lazy" />
      ) : (
        <span>{initials || '?'}</span>
      )}
    </div>
  )
}
