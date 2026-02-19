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
          setMessages(current => [...current, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId])

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles:user_id (
            name,
            avatar_url
          )
        `)
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
      // First, ensure user has a profile in Supabase
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single()

      if (!existingProfile) {
        // Create profile if it doesn't exist
        await supabase
          .from('profiles')
          .insert({
            id: userId,
            name: userName,
            avatar_url: userAvatar
          })
      }

      // Insert message
      const { error } = await supabase
        .from('messages')
        .insert({
          room_id: roomId,
          user_id: userId,
          content: content
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