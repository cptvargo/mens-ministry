import { useState, useRef, useEffect } from "react";
import { Send, Loader } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { EventCard } from "./EventCard";
import { useEvents } from "../hooks/useEvents";
import { useMessages } from "../hooks/useMessages";

export function ChatRoom({
  roomId,
  roomName,
  roomDescription,
  userId,
  userName,
  userAvatar,
  showEvents = false,
}) {
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const { events } = useEvents();
  const { messages, loading, sendMessage } = useMessages(roomId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await sendMessage(userId, userName, userAvatar, newMessage.trim());
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  // Filter events for this room
  const upcomingEvents = showEvents
    ? events.filter((e) => new Date(e.date) >= new Date()).slice(0, 3)
    : [];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 shadow-lg">
        <h2 className="text-xl font-bold mb-1">{roomName}</h2>
        {roomDescription && (
          <p className="text-sm text-blue-100">{roomDescription}</p>
        )}
      </div>

      {/* Events Section */}
      {showEvents && upcomingEvents.length > 0 && (
        <div className="flex-shrink-0 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="px-6 py-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 uppercase tracking-wide">
              Upcoming Events
            </h3>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} userId={userId} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 bg-slate-50 dark:bg-slate-900">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-slate-500 dark:text-slate-400">
                Loading messages...
              </p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Send className="w-10 h-10 text-white" />
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
                Start the conversation
              </p>
              <p className="text-slate-500 dark:text-slate-500 text-sm mt-2">
                Be the first to send a message!
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isOwn={message.user_id === userId}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-6 py-4">
        <form onSubmit={handleSend} className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 border-0 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            disabled={sending || loading}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending || loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
          >
            {sending ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span className="hidden sm:inline">Send</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
