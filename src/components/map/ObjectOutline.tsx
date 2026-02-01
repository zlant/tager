import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import type { OSMObject } from '../../types'

interface ObjectOutlineProps {
  object: OSMObject | null
}

export const ObjectOutline: React.FC<ObjectOutlineProps> = ({ object }) => {
  const map = useMap()
  const layerRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    if (!object) return

    if (layerRef.current) {
      map.removeLayer(layerRef.current)
    }

    const el = object.json
    const layerGroup = L.layerGroup()

    const nodeMap = new Map(
      object.fullJson.filter((e) => e.type === 'node').map((n) => [n.id, n])
    )

    const addPolygonForCoords = (coords: L.LatLng[]) => {
      if (coords.length === 0) return null
      const polygon = L.polygon(coords, {
        color: '#3388ff',
        weight: 1,
        fillOpacity: 0,
      })
      layerGroup.addLayer(polygon)
      return polygon
    }

    if (el.type === 'way' && el.nodes && object.fullJson.length > 0) {
      const coords: L.LatLng[] = []
      for (const ref of el.nodes) {
        const node = nodeMap.get(ref)
        if (node && node.lat != null && node.lon != null) {
          coords.push(L.latLng(node.lat, node.lon))
        }
      }
      const polygon = addPolygonForCoords(coords)
      if (polygon && coords.length > 1) {
        const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768
        map.fitBounds(polygon.getBounds(), {
          padding: [20, 20],
          ...(isMobile && { maxZoom: 18 }),
        })
      }
    }

    if (el.type === 'relation' && el.members && object.fullJson.length > 0) {
      const wayMap = new Map(
        object.fullJson.filter((e) => e.type === 'way').map((w) => [w.id, w])
      )
      let firstBounds: L.LatLngBounds | null = null
      for (const member of el.members) {
        if (member.type !== 'way') continue
        const way = wayMap.get(member.ref)
        if (!way?.nodes) continue
        const coords: L.LatLng[] = []
        for (const ref of way.nodes) {
          const node = nodeMap.get(ref)
          if (node && node.lat != null && node.lon != null) {
            coords.push(L.latLng(node.lat, node.lon))
          }
        }
        const polygon = addPolygonForCoords(coords)
        if (polygon) {
          const b = polygon.getBounds()
          if (!firstBounds) firstBounds = b
          else firstBounds.extend(b)
        }
      }
      if (firstBounds) {
        const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768
        map.fitBounds(firstBounds, {
          padding: [20, 20],
          ...(isMobile && { maxZoom: 18 }),
        })
      }
    }

    layerGroup.addTo(map)
    layerRef.current = layerGroup

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current)
      }
    }
  }, [object, map])

  return null
}
