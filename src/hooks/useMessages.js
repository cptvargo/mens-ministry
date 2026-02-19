import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useMessages(roomId) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch messages immediately
    fetchMessages()

    // Then poll every 3 seconds for new messages
    const interval = setInterval(() => {
      fetchMessages(true) // silent refresh
    }, 3000)

    return () => clearInterval(interval)
  }, [roomId])

  const fetchMessages = async (silent = false) => {
    try {
      if (!silent) setLoading(true)

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })

      if (error) throw error
      
      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  const sendMessage = async (userId, userName, userAvatar, content) => {
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          room_id: roomId,
          user_id: userId,
          content: content,
          user_name: userName,
          user_avatar: userAvatar
        })

      if (error) throw error

      // Immediately fetch to show your own message
      await fetchMessages(true)
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  return {
    messages,
    loading,
    sendMessage
  }
}