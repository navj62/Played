export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-ct-elevated flex items-center justify-center mb-5">
          <Icon className="w-7 h-7 text-ct-subtle" />
        </div>
      )}
      <h3 className="text-ct-text font-semibold text-lg mb-2">{title}</h3>
      {description && <p className="text-ct-muted text-sm max-w-sm leading-relaxed">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
