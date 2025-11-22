import { cn } from '../../lib/utils'

const Button = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm'

  const variants = {
    primary:
      'bg-gradient-to-r from-purple-600 via-fuchsia-500 to-rose-500 text-white hover:shadow-xl focus:ring-purple-400',
    secondary:
      'bg-gradient-to-r from-sky-500 to-indigo-500 text-white hover:shadow-lg focus:ring-sky-400',
    outline: 'border border-slate-200 text-slate-700 bg-white/80 hover:bg-white focus:ring-purple-200',
    ghost: 'text-slate-700 bg-white/60 hover:bg-white focus:ring-purple-100',
    danger: 'bg-gradient-to-r from-rose-500 to-red-500 text-white hover:shadow-lg focus:ring-rose-400',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
            <path
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Cargando...
        </span>
      ) : (
        children
      )}
    </button>
  )
}

export default Button
