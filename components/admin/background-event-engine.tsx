'use client'

import { useEffect } from 'react'
import { backgroundEventEngine } from '@/lib/services/background-event-engine'

export function BackgroundEventEngineProvider() {
  useEffect(() => {
    backgroundEventEngine.start()
    return () => backgroundEventEngine.stop()
  }, [])

  return null
}
