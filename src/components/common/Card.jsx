import { cn } from '../../lib/utils'

const Card = ({ children, className, ...props }) => (
  <div
    className={cn(
      'bg-white/80 backdrop-blur border border-slate-100 rounded-2xl shadow-lg shadow-purple-100/60',
      className,
    )}
    {...props}
  >
    {children}
  </div>
)

const CardHeader = ({ children, className, ...props }) => (
  <div className={cn('px-6 py-4 border-b border-slate-100/80', className)} {...props}>
    {children}
  </div>
)

const CardContent = ({ children, className, ...props }) => (
  <div className={cn('px-6 py-4', className)} {...props}>
    {children}
  </div>
)

const CardFooter = ({ children, className, ...props }) => (
  <div className={cn('px-6 py-4 border-t border-slate-100/80 flex gap-3 justify-end', className)} {...props}>
    {children}
  </div>
)

export { Card, CardHeader, CardContent, CardFooter }
