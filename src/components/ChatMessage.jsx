import { format } from "date-fns";
import { User } from "lucide-react";

export function ChatMessage({ message, isOwn }) {
  // Try to get user info from multiple sources
  const userName = message.profiles?.name || message.user_name || "Unknown";
  const avatar = message.profiles?.avatar_url || message.user_avatar;

  return (
    <div className={`flex gap-3 mb-4 ${isOwn ? "flex-row-reverse" : ""}`}>
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md">
          {avatar ? (
            <img
              src={avatar}
              alt={userName}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-6 h-6 text-white" />
          )}
        </div>
      </div>

      <div
        className={`flex-1 max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}
      >
        <div
          className={`flex items-baseline gap-2 mb-1 ${isOwn ? "flex-row-reverse" : ""}`}
        >
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            {userName}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {format(new Date(message.created_at), "h:mm a")}
          </span>
        </div>

        <div
          className={`rounded-2xl px-4 py-3 ${
            isOwn
              ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-sm"
              : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-sm shadow-sm"
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
      </div>
    </div>
  );
}
