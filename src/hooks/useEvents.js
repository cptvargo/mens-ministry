import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEvents()

    // Subscribe to event changes
    const channel = supabase
      .channel('events')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
        },
        () => {
          loadEvents()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true })

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  return {
    events,
    loading,
  }
}

export function useAttendance(eventId, userId) {
  const [attendance, setAttendance] = useState([])
  const [userAttendance, setUserAttendance] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!eventId) return

    loadAttendance()

    const channel = supabase
      .channel(`attendance-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_attendance',
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          loadAttendance()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [eventId])

  const loadAttendance = async () => {
    try {
      const { data, error } = await supabase
        .from('event_attendance')
        .select(`
          *,
          profiles (
            name,
            avatar_url
          )
        `)
        .eq('event_id', eventId)

      if (error) throw error
      
      setAttendance(data || [])
      const userRecord = data?.find(a => a.user_id === userId)
      setUserAttendance(userRecord?.status || null)
    } catch (error) {
      console.error('Error loading attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateAttendance = async (status) => {
    if (!userId || !eventId) return

    const { error } = await supabase
      .from('event_attendance')
      .upsert(
        {
          event_id: eventId,
          user_id: userId,
          status,
        },
        {
          onConflict: 'event_id,user_id',
        }
      )

    if (error) throw error
  }

  return {
    attendance,
    userAttendance,
    loading,
    updateAttendance,
  }
}
