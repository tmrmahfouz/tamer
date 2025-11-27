export default function LoadingSpinner({ size = 'md', fullScreen = false }: { size?: 'sm' | 'md' | 'lg'; fullScreen?: boolean }) {
  const sizeClasses = {
    sm: 'w-8 h-8 border-2',
    md: 'w-16 h-16 border-4',
    lg: 'w-24 h-24 border-4',
  }

  const spinner = (
    <div className={`${sizeClasses[size]} border-primary-600 border-t-transparent rounded-full animate-spin`}></div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {spinner}
      </div>
    )
  }

  return spinner
}
