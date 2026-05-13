/**
 * Mounts the BackgroundEventEngine for the lifetime of the admin shell.
 * Renders nothing; effect cleanup calls engine.stop() so the interval is
 * cleared on unmount / hot-reload.
 */
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
