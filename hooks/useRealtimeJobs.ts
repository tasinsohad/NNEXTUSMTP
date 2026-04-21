'use client'

import { useEffect, useState } from 'react'
import { Job, Mailbox, DNSRecord } from '@/types'

export function useRealtimeJobs(planId?: string) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([])
  const [dnsRecords, setDnsRecords] = useState<DNSRecord[]>([])

  useEffect(() => {
    if (!planId) return

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/plan-data?planId=${planId}`)
        if (res.ok) {
          const data = await res.json()
          setJobs(data.jobs || [])
          setMailboxes(data.mailboxes || [])
          setDnsRecords(data.dnsRecords || [])
        }
      } catch (error) {
        console.error('Error fetching plan data:', error)
      }
    }

    fetchData()

    // Polling as a fallback for Realtime on D1
    const interval = setInterval(fetchData, 3000)

    return () => clearInterval(interval)
  }, [planId])

  return { jobs, mailboxes, dnsRecords }
}
