'use client'

import { useState, useEffect } from 'react'
import { Session } from '@/types'
import { toast } from 'sonner'

export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch('/api/session')
        if (res.ok) {
          const data = await res.json()
          setSession(data.session)
        }
      } catch (error) {
        console.error('Error loading session:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSession()
  }, [])

  const updateSession = async (stage: number, payload: Record<string, unknown>) => {
    try {
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage, payload })
      })
      
      if (!res.ok) throw new Error('Failed to update session')
      
      const data = await res.json()
      setSession(data.session)
      return data.session
    } catch (error) {
      const err = error instanceof Error ? error.message : 'Unknown error'
      toast.error('Failed to save session: ' + err)
      throw error
    }
  }

  return { session, loading, updateSession }
}
