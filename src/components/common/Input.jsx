import { cn } from '../../lib/utils'

const Input = ({ label, error, className, type = 'text', ...props }) => (
  <div className="flex flex-col gap-2">
    {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
    <input
      type={type}
      className={cn(
        'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all',
        error && 'border-red-500 focus:ring-red-500',
        className,
      )}
      {...props}
    />
    {error && <span className="text-xs text-red-500">{error}</span>}
  </div>
)

export default Input
