import { AlertCircle, CheckCircle, Info, X } from 'lucide-react'

interface AlertProps {
  type: 'success' | 'error' | 'info'
  message: string
  onClose?: () => void
  className?: string
}

export default function Alert({ type, message, onClose, className = '' }: AlertProps) {
  const styles = {
    success: {
      container: 'bg-green-50 border-green-200 text-green-800',
      icon: CheckCircle,
      iconColor: 'text-green-500'
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: AlertCircle,
      iconColor: 'text-red-500'
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: Info,
      iconColor: 'text-blue-500'
    }
  }

  const { container, icon: Icon, iconColor } = styles[type]

  return (
    <div className={`border rounded-lg p-4 flex items-start gap-3 ${container} ${className}`}>
      <Icon className={`flex-shrink-0 h-5 w-5 mt-0.5 ${iconColor}`} />
      <div className="flex-1">
        <p className="text-sm">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}