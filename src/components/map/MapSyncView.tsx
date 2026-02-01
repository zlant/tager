import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import type L from 'leaflet'

export interface ViewState {
  lat: number
  lng: number
  zoom: number
}

interface MapSyncViewProps {
  viewState: ViewState | null
  sourceMapRef: React.MutableRefObject<L.Map | null>
  onViewChange: (map: L.Map, lat: number, lng: number, zoom: number) => void
  ignoreFromRef: React.MutableRefObject<L.Map | null>
}

export const MapSyncView: React.FC<MapSyncViewProps> = ({
  viewState,
  sourceMapRef,
  onViewChange,
  ignoreFromRef,
}) => {
  const map = useMap()

  useEffect(() => {
    if (!viewState || sourceMapRef.current === map) return
    ignoreFromRef.current = map
    map.setView([viewState.lat, viewState.lng], viewState.zoom, { animate: false })
  }, [map, viewState, sourceMapRef, ignoreFromRef])

  useEffect(() => {
    const handler = () => {
      if (map === ignoreFromRef.current) {
        ignoreFromRef.current = null
        return
      }
      const center = map.getCenter()
      onViewChange(map, center.lat, center.lng, map.getZoom())
    }
    map.on('moveend', handler)
    return () => {
      map.off('moveend', handler)
    }
  }, [map, onViewChange, ignoreFromRef])

  return null
}
