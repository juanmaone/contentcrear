import { cn } from '../../lib/utils'

const Card = ({ children, className, ...props }) => (
  <div className={cn('bg-white rounded-lg shadow-md border border-gray-100', className)} {...props}>
    {children}
  </div>
)

const CardHeader = ({ children, className, ...props }) => (
  <div className={cn('px-6 py-4 border-b border-gray-100', className)} {...props}>
    {children}
  </div>
)

const CardContent = ({ children, className, ...props }) => (
  <div className={cn('px-6 py-4', className)} {...props}>
    {children}
  </div>
)

const CardFooter = ({ children, className, ...props }) => (
  <div className={cn('px-6 py-4 border-t border-gray-100 flex gap-3 justify-end', className)} {...props}>
    {children}
  </div>
)

export { Card, CardHeader, CardContent, CardFooter }
