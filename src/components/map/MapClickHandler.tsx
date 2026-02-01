import type L from 'leaflet'
import { useMap, useMapEvents } from 'react-leaflet'

interface MapClickHandlerProps {
  onMapClick: (bounds: L.LatLngBounds) => void
  onMoveEnd?: (center: L.LatLng, zoom: number) => void
}

export const MapClickHandler: React.FC<MapClickHandlerProps> = ({ onMapClick, onMoveEnd }) => {
  const map = useMap()
  useMapEvents({
    moveend: () => {
      onMapClick(map.getBounds())
      onMoveEnd?.(map.getCenter(), map.getZoom())
    },
  })
  return null
}