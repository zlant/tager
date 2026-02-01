import { useState, useCallback } from 'react'
import { loadSavedPosition, savePosition as savePositionStorage } from '../utils/storage'

export function useMapPosition() {
  const [initialPosition] = useState(loadSavedPosition)
  const savePosition = useCallback((center: { lat: number; lng: number }, zoom: number) => {
    savePositionStorage(center, zoom)
  }, [])
  return { initialPosition, savePosition }
}
