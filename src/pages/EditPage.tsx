import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useAuth } from '../contexts/AuthContext'
import packageJson from '../../package.json'
import './EditPage.css'

const EDITOR_TAG = `tager ${packageJson.version}`

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

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

interface OSMObject {
  id: string
  type: string
  version: string
  changeset: string
  timestamp: string
  json: OverpassElement
  fullJson: OverpassElement[]
}

const POPULAR_SPORTS = [
  'football',
  'basketball',
  'tennis',
  'volleyball',
  'soccer',
  'baseball',
  'rugby',
  'ice_hockey',
  'badminton',
  'table_tennis',
  'handball',
  'futsal',
  'beachvolleyball',
  'american_football',
  'cricket',
]

interface ViewState {
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

const MapSyncView: React.FC<MapSyncViewProps> = ({
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

interface ObjectOutlineProps {
  object: OSMObject | null
}

const ObjectOutline: React.FC<ObjectOutlineProps> = ({ object }) => {
  const map = useMap()
  const layerRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    if (!object) return

    if (layerRef.current) {
      map.removeLayer(layerRef.current)
    }

    const el = object.json
    const layerGroup = L.layerGroup()

    if (el.type === 'way' && el.nodes && object.fullJson.length > 0) {
      const nodeMap = new Map(object.fullJson.filter((e) => e.type === 'node').map((n) => [n.id, n]))
      const coords: L.LatLng[] = []
      for (const ref of el.nodes) {
        const node = nodeMap.get(ref)
        if (node && node.lat != null && node.lon != null) {
          coords.push(L.latLng(node.lat, node.lon))
        }
      }
      if (coords.length > 0) {
        const polygon = L.polygon(coords, {
          color: '#3388ff',
          weight: 1,
          fillOpacity: 0,
        })
        layerGroup.addLayer(polygon)
        if (coords.length > 1) {
          const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768
          map.fitBounds(polygon.getBounds(), {
            padding: [20, 20],
            ...(isMobile && { maxZoom: 18 }),
          })
        }
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

const EditPage = () => {
  const navigate = useNavigate()
  const { user, token } = useAuth()
  const [objects, setObjects] = useState<OSMObject[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedSports, setSelectedSports] = useState<string[]>([])
  const [customSport, setCustomSport] = useState('')
  const [changes, setChanges] = useState<Array<{ object: OSMObject; sport: string }>>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [viewState, setViewState] = useState<ViewState | null>(null)
  const sourceMapRef = useRef<L.Map | null>(null)
  const ignoreFromRef = useRef<L.Map | null>(null)
  const formCellRef = useRef<HTMLDivElement>(null)

  const initialZoom =
    typeof window !== 'undefined' && window.innerWidth <= 768 ? 13 : 15

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentIndex])

  const handleViewChange = useCallback((map: L.Map, lat: number, lng: number, zoom: number) => {
    if (map === ignoreFromRef.current) {
      ignoreFromRef.current = null
      return
    }
    setViewState({ lat, lng, zoom })
    sourceMapRef.current = map
  }, [])

  useEffect(() => {
    const storedObjects = sessionStorage.getItem('osm_objects')
    const storedIndex = sessionStorage.getItem('current_index')
    const storedFullJson = sessionStorage.getItem('osm_full_json')

    if (storedObjects) {
      try {
        const parsed = JSON.parse(storedObjects) as OSMObject[]
        const fullJson: OverpassElement[] = storedFullJson ? JSON.parse(storedFullJson) : []
        setObjects(parsed.map((o) => ({ ...o, fullJson })))
      } catch {
        setObjects([])
      }
    }
    if (storedIndex) {
      setCurrentIndex(parseInt(storedIndex))
    }
  }, [])

  const currentObject = objects[currentIndex] || null

  const handleSportToggle = (sport: string) => {
    setSelectedSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    )
  }

  const handleConfirm = () => {
    const sportValue = customSport.trim() || selectedSports.join(';')

    if (!sportValue) {
      alert('Выберите или введите значение для тега sport')
      return
    }

    const newChanges = [...changes, { object: currentObject!, sport: sportValue }]
    setChanges(newChanges)
    setSelectedSports([])
    setCustomSport('')

    if (currentIndex < objects.length - 1) {
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      sessionStorage.setItem('current_index', nextIndex.toString())
    } else {
      handleFinish(newChanges)
    }
  }

  const handleSkip = () => {
    setSelectedSports([])
    setCustomSport('')

    if (currentIndex < objects.length - 1) {
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      sessionStorage.setItem('current_index', nextIndex.toString())
    } else {
      if (changes.length > 0) {
        handleFinish()
      } else {
        alert('Все объекты обработаны. Нет изменений для сохранения.')
        navigate('/search')
      }
    }
  }

  const handleFinish = async (overrideChanges?: Array<{ object: OSMObject; sport: string }>) => {
    const changesToSave = overrideChanges ?? changes
    if (changesToSave.length === 0) {
      alert('Нет изменений для сохранения')
      return
    }

    setIsSubmitting(true)

    try {
      const changesetId = await createChangeset()
      const osmChangeXml = generateOSMChangeXML(changesToSave, changesetId)
      await uploadChangesToOSM(changesetId, osmChangeXml)
      await closeChangeset(changesetId)

      alert(`Изменения сохранены в OSM! Обработано объектов: ${changesToSave.length}`)
      navigate('/search')
    } catch (error) {
      console.error('Error saving changes:', error)
      alert('Ошибка при сохранении изменений')
    } finally {
      setIsSubmitting(false)
    }
  }

  const createChangeset = async (): Promise<string> => {
    const changesetXml = `<?xml version="1.0" encoding="UTF-8"?>
<osm>
  <changeset>
    <tag k="created_by" v="${EDITOR_TAG}"/>
    <tag k="comment" v="Добавление тега sport для объектов leisure=pitch"/>
  </changeset>
</osm>`

    const response = await fetch('https://api.openstreetmap.org/api/0.6/changeset/create', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'text/xml',
      },
      body: changesetXml,
    })

    if (!response.ok) {
      throw new Error('Failed to create changeset')
    }

    return await response.text()
  }

  const closeChangeset = async (changesetId: string) => {
    await fetch(`https://api.openstreetmap.org/api/0.6/changeset/${changesetId}/close`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  const escapeXml = (s: string) =>
    String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')

  const elementToOsmXml = (el: OverpassElement, changesetId: string, sport: string): string => {
    const tags = { ...el.tags, sport }
    const v = el.version ?? 1
    const ts = el.timestamp ?? ''
    if (el.type === 'way') {
      let out = `  <way id="${el.id}" version="${v}" changeset="${changesetId}" timestamp="${ts}">\n`
      for (const ref of el.nodes ?? []) out += `    <nd ref="${ref}"/>\n`
      for (const [k, v] of Object.entries(tags)) out += `    <tag k="${escapeXml(k)}" v="${escapeXml(v)}"/>\n`
      out += '  </way>'
      return out
    }
    if (el.type === 'relation') {
      let out = `  <relation id="${el.id}" version="${v}" changeset="${changesetId}" timestamp="${ts}">\n`
      for (const m of el.members ?? []) out += `    <member type="${m.type}" ref="${m.ref}" role="${m.role ?? ''}"/>\n`
      for (const [k, v] of Object.entries(tags)) out += `    <tag k="${escapeXml(k)}" v="${escapeXml(v)}"/>\n`
      out += '  </relation>'
      return out
    }
    return ''
  }

  const generateOSMChangeXML = (changes: Array<{ object: OSMObject; sport: string }>, changesetId: string): string => {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<osmChange version="0.6" generator="${EDITOR_TAG}">
  <modify>
`
    for (const change of changes) {
      const part = elementToOsmXml(change.object.json, changesetId, change.sport)
      if (part) xml += part + '\n'
    }
    xml += `  </modify>
</osmChange>`
    return xml
  }

  const uploadChangesToOSM = async (changesetId: string, osmChangeXml: string) => {
    const response = await fetch(
      `https://api.openstreetmap.org/api/0.6/changeset/${changesetId}/upload`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/xml',
        },
        body: osmChangeXml,
      }
    )
    if (!response.ok) {
      const text = await response.text()
      throw new Error(text || `Upload failed: ${response.status}`)
    }
  }

  if (!currentObject) {
    return (
      <div className="edit-page">
        <div className="no-objects">Объекты не найдены</div>
      </div>
    )
  }

  return (
    <div className="edit-page">
      <div className="edit-header">
        <h2>Редактирование объектов</h2>
        <div className="edit-info">
          <span>
            Объект {currentIndex + 1} из {objects.length}
          </span>
          {currentObject.json.timestamp && (
            <span className="edit-timestamp" title={currentObject.json.timestamp}>
              Изменён: {new Date(currentObject.json.timestamp).toLocaleString()}
            </span>
          )}
          <a
            href={`https://www.openstreetmap.org/${currentObject.json.type}/${currentObject.json.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="osm-link"
          >
            Открыть на osm.org
          </a>
        </div>
      </div>
      <div className="edit-grid">
        <div className="map-cell map-top-left">
          <MapContainer
            center={[55.7558, 37.6173]}
            zoom={initialZoom}
            maxZoom={25}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxNativeZoom={19}
              maxZoom={25}
            />
            <MapSyncView
              viewState={viewState}
              sourceMapRef={sourceMapRef}
              onViewChange={handleViewChange}
              ignoreFromRef={ignoreFromRef}
            />
            <MapResizeFix />
            <ObjectOutline object={currentObject} />
          </MapContainer>
        </div>
        <div className="map-cell map-top-right">
          <MapContainer
            center={[55.7558, 37.6173]}
            zoom={initialZoom}
            maxZoom={25}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; Esri'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxNativeZoom={19}
              maxZoom={25}
            />
            <MapSyncView
              viewState={viewState}
              sourceMapRef={sourceMapRef}
              onViewChange={handleViewChange}
              ignoreFromRef={ignoreFromRef}
            />
            <ObjectOutline object={currentObject} />
          </MapContainer>
        </div>
        <div className="map-cell map-bottom-left">
          <MapContainer
            center={[55.7558, 37.6173]}
            zoom={initialZoom}
            maxZoom={25}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.mapbox.com/">Mapbox</a>'
              url={`https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?access_token=${import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ?? ''}`}
              maxNativeZoom={22}
              maxZoom={25}
            />
            <MapSyncView
              viewState={viewState}
              sourceMapRef={sourceMapRef}
              onViewChange={handleViewChange}
              ignoreFromRef={ignoreFromRef}
            />
            <ObjectOutline object={currentObject} />
          </MapContainer>
        </div>
        <button
          type="button"
          className="scroll-to-form-btn"
          onClick={() => formCellRef.current?.scrollIntoView({ behavior: 'smooth' })}
          aria-label="Проскроллить к форме"
        >
          К форме
        </button>
        <div className="form-cell" ref={formCellRef}>
          <div className="sport-form">
            <h3>Выберите значение тега sport</h3>
            <div className="sport-checkboxes">
              {POPULAR_SPORTS.map((sport) => (
                <label key={sport} className="sport-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedSports.includes(sport)}
                    onChange={() => handleSportToggle(sport)}
                  />
                  <span>{sport}</span>
                </label>
              ))}
            </div>
            <div className="custom-sport-input">
              <label>
                Или введите свое значение:
                <input
                  type="text"
                  value={customSport}
                  onChange={(e) => setCustomSport(e.target.value)}
                  placeholder="например: football;basketball"
                />
              </label>
            </div>
            <div className="form-buttons">
              <button
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="confirm-button"
              >
                Подтвердить и продолжить
              </button>
              <button
                onClick={handleSkip}
                disabled={isSubmitting}
                className="skip-button"
              >
                Пропустить
              </button>
              <button
                onClick={() => handleFinish()}
                disabled={isSubmitting}
                className="finish-button"
              >
                Завершить
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditPage
