import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useMessages(roomId) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch initial messages
    fetchMessages()

    // Subscribe to new messages
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          console.log('New message received:', payload)
          // Add the new message with user info from localStorage
          const newMessage = {
            ...payload.new,
            profiles: null // Will be populated from local user data
          }
          setMessages(current => [...current, newMessage])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId])

  const fetchMessages = async () => {
    try {
      // Just fetch messages without profiles join
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
      setLoading(false)
    }
  }

  const sendMessage = async (userId, userName, userAvatar, content) => {
    try {
      // Insert message with user info embedded in metadata
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