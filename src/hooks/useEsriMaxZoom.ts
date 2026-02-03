import { useState, useEffect, useRef } from 'react'
import { getEsriWorldImageryMaxZoom } from '../utils/esriMaxZoom'

const DEBOUNCE_MS = 200
const INITIAL_MAX_ZOOM = 17

export function useEsriMaxZoom(center: { lat: number; lng: number } | null) {
  const [maxZoom, setMaxZoom] = useState(INITIAL_MAX_ZOOM)
  const [loading, setLoading] = useState(false)
  const firstRunDone = useRef(false)

  useEffect(() => {
    if (!center) return
    const run = () => {
      setLoading(true)
      getEsriWorldImageryMaxZoom(center.lat, center.lng)
        .then(setMaxZoom)
        .finally(() => setLoading(false))
    }
    if (!firstRunDone.current) {
      firstRunDone.current = true
      run()
      return
    }
    const t = setTimeout(run, DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [center?.lat, center?.lng])

  return { maxZoom, loading }
}
