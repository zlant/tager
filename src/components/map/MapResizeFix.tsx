import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

export const MapResizeFix: React.FC = () => {
  const map = useMap()
  useEffect(() => {
    const fix = () => map.invalidateSize()
    const t = setTimeout(fix, 100)
    window.addEventListener('resize', fix)
    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', fix)
    }
  }, [map])
  return null
}
