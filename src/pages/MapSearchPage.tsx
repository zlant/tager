import { useState } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import type L from 'leaflet'
import { useAuth } from '../contexts/AuthContext'
import { useMapPosition } from '../hooks/useMapPosition'
import { useEditModeStorage } from '../hooks/useEditModeStorage'
import { useOverpassSearch } from '../hooks/useOverpassSearch'
import { MapResizeFix, MapClickHandler } from '../components/map'
import './MapSearchPage.css'

const MapSearchPage = () => {
  const { user } = useAuth()
  const { initialPosition, savePosition } = useMapPosition()
  const { editMode, setEditMode } = useEditModeStorage()
  const { isLoading, runSearch } = useOverpassSearch(editMode)
  const [bounds, setBounds] = useState<L.LatLngBounds | null>(null)

  const handleConfirm = () => {
    if (bounds) runSearch(bounds)
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
          <p className="sidebar-hint">
            Переместите карту к нужной области и нажмите «Загрузить объекты»
          </p>
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
