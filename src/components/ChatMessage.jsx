import { format } from 'date-fns'
import { User } from 'lucide-react'

export function ChatMessage({ message, isOwn }) {
  const avatar = message.profiles?.avatar_url
  const name = message.profiles?.name || 'Unknown'
  const timestamp = format(new Date(message.created_at), 'h:mm a')

  return (
    <div className={`flex gap-3 mb-4 animate-slide-up ${isOwn ? 'flex-row-reverse' : ''}`}>
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md">
          {avatar ? (
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
          ) : (
            <User className="w-6 h-6 text-white" />
          )}
        </div>
      </div>

      <div className={`flex-1 max-w-[75%] ${isOwn ? 'flex flex-col items-end' : ''}`}>
        <div className={`flex items-baseline gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            {isOwn ? 'You' : name}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {timestamp}
          </span>
        </div>

        <div
          className={`px-4 py-3 rounded-2xl shadow-sm ${
            isOwn
              ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-sm'
              : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-sm border border-slate-200 dark:border-slate-700'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
      </div>
    </div>
  )
}
