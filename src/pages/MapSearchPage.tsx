import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useAuth } from '../contexts/AuthContext'
import './MapSearchPage.css'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const MAP_POSITION_KEY = 'mapSearchPosition'

export type EditMode = 'pitch' | 'residential'

const EDIT_MODE_KEY = 'edit_mode'

interface OverpassElement {
  type: 'node' | 'way' | 'relation'
  id: number
  version?: number
  changeset?: number
  timestamp?: string
  lat?: number
  lon?: number
  nodes?: number[]
  members?: Array<{ type: string; ref: number; role?: string }>
  tags?: Record<string, string>
}

interface OverpassResponse {
  elements: OverpassElement[]
}

const loadSavedPosition = (): { center: [number, number]; zoom: number } => {
  try {
    const raw = localStorage.getItem(MAP_POSITION_KEY)
    if (!raw) return { center: [55.7558, 37.6173], zoom: 13 }
    const { center, zoom } = JSON.parse(raw)
    if (!Array.isArray(center) || center.length !== 2 || typeof zoom !== 'number') return { center: [55.7558, 37.6173], zoom: 13 }
    const [lat, lng] = center
    if (typeof lat !== 'number' || typeof lng !== 'number' || lat < -90 || lat > 90 || lng < -180 || lng > 180) return { center: [55.7558, 37.6173], zoom: 13 }
    return { center: [lat, lng], zoom: Math.min(25, Math.max(0, zoom)) }
  } catch {
    return { center: [55.7558, 37.6173], zoom: 13 }
  }
}

const EDIT_MODE_STORAGE_KEY = 'mapSearchEditMode'

const loadSavedEditMode = (): EditMode => {
  const raw = localStorage.getItem(EDIT_MODE_STORAGE_KEY)
  if (raw === 'pitch' || raw === 'residential') return raw
  return 'pitch'
}

interface MapClickHandlerProps {
  onMapClick: (bounds: L.LatLngBounds) => void
  onMoveEnd?: (center: L.LatLng, zoom: number) => void
}

const MapResizeFix: React.FC = () => {
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

const MapClickHandler: React.FC<MapClickHandlerProps> = ({ onMapClick, onMoveEnd }) => {
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds()
      onMapClick(bounds)
      onMoveEnd?.(map.getCenter(), map.getZoom())
    },
  })
  return null
}

const MapSearchPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [initialPosition] = useState(() => loadSavedPosition())
  const [bounds, setBounds] = useState<L.LatLngBounds | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [editMode, setEditModeState] = useState<EditMode>(loadSavedEditMode)

  const setEditMode = (mode: EditMode) => {
    setEditModeState(mode)
    localStorage.setItem(EDIT_MODE_STORAGE_KEY, mode)
  }

  const savePosition = (center: L.LatLng, zoom: number) => {
    localStorage.setItem(MAP_POSITION_KEY, JSON.stringify({
      center: [center.lat, center.lng],
      zoom,
    }))
  }

  const handleConfirm = async () => {
    if (!bounds) return

    setIsLoading(true)
    try {
      const bbox = `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`
      const overpassQuery =
        editMode === 'pitch'
          ? `
        [out:json][timeout:25];
        (
          way["leisure"="pitch"][!"sport"](${bbox});
          relation["leisure"="pitch"][!"sport"](${bbox});
        );
        (._;>;);
        out meta;
      `
          : `
        [out:json][timeout:25];
        (
          way["landuse"="residential"][!"residential"](${bbox});
          relation["landuse"="residential"][!"residential"](${bbox});
        );
        (._;>;);
        out meta;
      `

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(overpassQuery)}`,
      })

      if (!response.ok) {
        throw new Error('Failed to fetch data from Overpass')
      }

      const data: OverpassResponse = await response.json()
      const targetElements =
        editMode === 'pitch'
          ? [
              ...(data.elements ?? []).filter(
                (e) => e.type === 'way' && e.tags?.leisure === 'pitch' && !e.tags?.sport
              ),
              ...(data.elements ?? []).filter(
                (e) =>
                  e.type === 'relation' &&
                  e.tags?.leisure === 'pitch' &&
                  !e.tags?.sport
              ),
            ]
          : [
              ...(data.elements ?? []).filter(
                (e) =>
                  e.type === 'way' &&
                  e.tags?.landuse === 'residential' &&
                  !e.tags?.residential
              ),
              ...(data.elements ?? []).filter(
                (e) =>
                  e.type === 'relation' &&
                  e.tags?.landuse === 'residential' &&
                  !e.tags?.residential
              ),
            ]

      if (targetElements.length === 0) {
        alert(
          editMode === 'pitch'
            ? 'В выбранной области не найдено объектов leisure=pitch без тега sport'
            : 'В выбранной области не найдено объектов landuse=residential без тега residential'
        )
        setIsLoading(false)
        return
      }

      const allElements = data.elements ?? []

      const objects = targetElements.map((el) => ({
        id: String(el.id),
        type: el.type,
        version: String(el.version ?? 1),
        changeset: String(el.changeset ?? 0),
        timestamp: el.timestamp ?? '',
        json: el,
      }))

      try {
        sessionStorage.setItem(EDIT_MODE_KEY, editMode)
        sessionStorage.setItem('osm_full_json', JSON.stringify(allElements))
        sessionStorage.setItem('osm_objects', JSON.stringify(objects))
        sessionStorage.setItem('current_index', '0')
      } catch (e) {
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
          sessionStorage.removeItem('osm_full_json')
          try {
            sessionStorage.setItem('osm_objects', JSON.stringify(objects))
            sessionStorage.setItem('current_index', '0')
          } catch {
            alert('Слишком много объектов для загрузки. Уменьшите область поиска.')
            setIsLoading(false)
            return
          }
          alert('Объекты загружены без геометрии площадок (ограничение памяти). Редактирование тегов доступно.')
        } else {
          throw e
        }
      }
      navigate('/edit')
    } catch (error) {
      console.error('Error loading objects:', error)
      alert('Ошибка при загрузке объектов. Попробуйте еще раз.')
      setIsLoading(false)
    }
  }

  return (
    <div className="map-search-page">
      <div className="map-search-header">
        <h2>Поиск местности</h2>
        <div className="user-info">
          <span>Пользователь: {user?.displayName}</span>
        </div>
      </div>
      <div className="map-search-body">
        <aside className="map-search-sidebar">
          <div className="mode-selector">
            <span className="mode-label">Режим</span>
            <label className="mode-option">
              <input
                type="radio"
                name="editMode"
                checked={editMode === 'pitch'}
                onChange={() => setEditMode('pitch')}
              />
              <span>leisure=pitch без sport</span>
            </label>
            <label className="mode-option">
              <input
                type="radio"
                name="editMode"
                checked={editMode === 'residential'}
                onChange={() => setEditMode('residential')}
              />
              <span>landuse=residential без residential</span>
            </label>
          </div>
          <p className="sidebar-hint">Переместите карту к нужной области и нажмите «Загрузить объекты»</p>
          <button
            onClick={handleConfirm}
            disabled={!bounds || isLoading}
            className="confirm-button"
          >
            {isLoading ? 'Загрузка...' : 'Загрузить объекты'}
          </button>
        </aside>
        <div className="map-container-wrapper">
          <MapContainer
            center={initialPosition.center}
            zoom={initialPosition.zoom}
            maxZoom={25}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxNativeZoom={19}
              maxZoom={25}
            />
            <MapResizeFix />
            <MapClickHandler
              onMapClick={(newBounds) => setBounds(newBounds)}
              onMoveEnd={savePosition}
            />
          </MapContainer>
        </div>
      </div>
    </div>
  )
}

export default MapSearchPage
