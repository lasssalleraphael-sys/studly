'use client'
import { Mic, Clock, AlertCircle } from 'lucide-react'

interface UsageDisplayProps {
  planName: string
  lecturesUsed: number  // Now represents hours used
  lecturesLimit: number // Now represents hours limit
}

const PLAN_LIMITS: Record<string, number> = {
  starter: 7,
  pro: 18,
  elite: 37,
  basic: 7,
}

function formatHours(hours: number): string {
  if (hours < 1) {
    const minutes = Math.round(hours * 60)
    return `${minutes} min`
  }
  return `${hours.toFixed(1)} hrs`
}

export default function UsageDisplay({ planName, lecturesUsed, lecturesLimit }: UsageDisplayProps) {
  const limit = lecturesLimit || PLAN_LIMITS[planName.toLowerCase()] || 7
  const used = lecturesUsed || 0
  const remaining = Math.max(0, limit - used)
  const percentage = Math.min(100, (used / limit) * 100)

  const now = new Date()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const daysUntilReset = Math.ceil((nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  const getStatus = () => {
    if (percentage >= 100) {
      return {
        message: "You've reached this month's limit",
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-700',
        progressColor: 'bg-red-500',
        icon: AlertCircle,
      }
    }
    if (percentage >= 80) {
      return {
        message: "Almost at this month's limit",
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        textColor: 'text-amber-700',
        progressColor: 'bg-amber-500',
        icon: Clock,
      }
    }
    return {
      message: `${formatHours(remaining)} remaining`,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      textColor: 'text-blue-700',
      progressColor: 'bg-blue-600',
      icon: Mic,
    }
  }

  const status = getStatus()
  const StatusIcon = status.icon

  return (
    <div className={status.bgColor + ' border ' + status.borderColor + ' rounded-xl p-5'}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={'w-10 h-10 rounded-lg ' + status.bgColor + ' flex items-center justify-center'}>
            <StatusIcon className={'w-5 h-5 ' + status.textColor} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Monthly Usage</h3>
            <p className="text-xs text-gray-500 capitalize">{planName} Plan</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Resets in</p>
          <p className="font-semibold text-gray-900">{daysUntilReset} days</p>
        </div>
      </div>
      <div className="mb-3">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-gray-900">{formatHours(used)}</span>
          <span className="text-gray-500">/ {limit} hours</span>
        </div>
        <p className={'text-sm ' + status.textColor + ' font-medium mt-1'}>{status.message}</p>
      </div>
      <div className="h-3 bg-white rounded-full overflow-hidden shadow-inner">
        <div className={'h-full ' + status.progressColor + ' rounded-full transition-all duration-500 ease-out'} style={{ width: percentage + '%' }} />
      </div>
      <p className="text-xs text-gray-500 mt-3">Usage resets on the 1st of each month</p>
    </div>
  )
}
