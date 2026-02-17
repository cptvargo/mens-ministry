import { format } from 'date-fns'
import { Calendar, Users, Check, X } from 'lucide-react'
import { useAttendance } from '../hooks/useEvents'

export function EventCard({ event, userId }) {
  const { attendance, userAttendance, updateAttendance } = useAttendance(event.id, userId)

  const attendingCount = attendance.filter(a => a.status === 'attending').length
  const notAttendingCount = attendance.filter(a => a.status === 'not_attending').length

  const handleAttendance = async (status) => {
    try {
      await updateAttendance(status)
    } catch (error) {
      console.error('Error updating attendance:', error)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-5 mb-4 animate-slide-up hover:shadow-xl transition-shadow">
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex flex-col items-center justify-center text-white shadow-md">
          <span className="text-2xl font-bold">
            {format(new Date(event.date), 'd')}
          </span>
          <span className="text-xs uppercase">
            {format(new Date(event.date), 'MMM')}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            {event.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-2">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(event.date), 'EEEE, MMMM d, yyyy')}</span>
          </div>
          {event.description && (
            <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
              {event.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
            <Check className="w-4 h-4" />
            <span className="font-semibold">{attendingCount}</span>
          </div>
          <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
            <X className="w-4 h-4" />
            <span className="font-semibold">{notAttendingCount}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleAttendance('attending')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              userAttendance === 'attending'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-green-50 dark:hover:bg-green-900/20'
            }`}
          >
            Attending
          </button>
          <button
            onClick={() => handleAttendance('not_attending')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              userAttendance === 'not_attending'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20'
            }`}
          >
            Can't Make It
          </button>
        </div>
      </div>

      {attendance.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              Who's Coming
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {attendance
              .filter(a => a.status === 'attending')
              .map(a => (
                <div
                  key={a.id}
                  className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full border border-green-200 dark:border-green-800"
                >
                  {a.profiles?.avatar_url ? (
                    <img
                      src={a.profiles.avatar_url}
                      alt={a.profiles.name}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">
                      <Users className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <span className="text-xs font-medium text-green-900 dark:text-green-100">
                    {a.profiles?.name || 'Unknown'}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
