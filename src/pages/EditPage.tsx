import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer } from 'react-leaflet'
import { useAuth } from '../contexts/AuthContext'
import type L from 'leaflet'
import { useEditSession } from '../hooks/useOverpassSearch'
import { useEsriMaxZoom } from '../hooks/useEsriMaxZoom'
import { saveChangesToOSM } from '../api/osm'
import { MapResizeFix, MapSyncView, ObjectOutline } from '../components/map'
import { EditHeader, TagForm } from '../components/edit'
import type { PendingChange, TagKeyForMode } from '../types'
import { DEFAULT_MAP_CENTER } from '../constants'
import './EditPage.css'

const initialZoom =
  typeof window !== 'undefined' && window.innerWidth <= 768 ? 13 : 15

const EditPage = () => {
  const navigate = useNavigate()
  const { token } = useAuth()
  const session = useEditSession()

  type FormState = {
    selectedSports: string[]
    customSport: string
    selectedResidential: string
    customResidential: string
  }
  const emptyForm: FormState = {
    selectedSports: [],
    customSport: '',
    selectedResidential: '',
    customResidential: '',
  }

  const [formStateByObjectId, setFormStateByObjectId] = useState<Record<string, FormState>>({})
  const [selectedSports, setSelectedSports] = useState<string[]>([])
  const [customSport, setCustomSport] = useState('')
  const [selectedResidential, setSelectedResidential] = useState<string>('')
  const [customResidential, setCustomResidential] = useState('')
  const [changes, setChanges] = useState<PendingChange[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const objectKey = (id: string, type: string) => `${type}/${id}`

  const [viewState, setViewState] = useState<{ lat: number; lng: number; zoom: number } | null>(null)
  const sourceMapRef = useRef<L.Map | null>(null)
  const ignoreFromRef = useRef<L.Map | null>(null)
  const formCellRef = useRef<HTMLDivElement>(null)

  const { maxZoom: esriMaxZoom } = useEsriMaxZoom(
    viewState
      ? { lat: viewState.lat, lng: viewState.lng }
      : { lat: DEFAULT_MAP_CENTER[0], lng: DEFAULT_MAP_CENTER[1] }
  )

  const handleViewChange = useCallback((map: L.Map, lat: number, lng: number, zoom: number) => {
    if (map === ignoreFromRef.current) {
      ignoreFromRef.current = null
      return
    }
    setViewState({ lat, lng, zoom })
    sourceMapRef.current = map
  }, [])

  useEffect(() => {
    if (session?.currentIndex != null) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [session?.currentIndex])

  useEffect(() => {
    if (!session?.currentObject) return
    const key = objectKey(session.currentObject.id, session.currentObject.type)
    const saved = formStateByObjectId[key] ?? emptyForm
    setSelectedSports(saved.selectedSports)
    setCustomSport(saved.customSport)
    setSelectedResidential(saved.selectedResidential)
    setCustomResidential(saved.customResidential)
  }, [session?.currentIndex, session?.currentObject?.id, session?.currentObject?.type, formStateByObjectId])

  const saveFormForCurrentObject = useCallback(() => {
    if (!session?.currentObject) return
    const key = objectKey(session.currentObject.id, session.currentObject.type)
    setFormStateByObjectId((prev) => ({
      ...prev,
      [key]: {
        selectedSports,
        customSport,
        selectedResidential,
        customResidential,
      },
    }))
  }, [session?.currentObject, selectedSports, customSport, selectedResidential, customResidential])

  const handleSportToggle = (sport: string) => {
    setSelectedSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    )
  }

  const handleResidentialSelect = (value: string) => {
    setSelectedResidential((prev) => (prev === value ? '' : value))
  }

  const tagKey: TagKeyForMode = session?.editMode === 'pitch' ? 'sport' : 'residential'

  const handleConfirm = () => {
    if (!session?.currentObject) return
    const tagValue =
      session.editMode === 'pitch'
        ? customSport.trim() || selectedSports.join(';')
        : customResidential.trim() || selectedResidential

    if (!tagValue) {
      alert(
        session.editMode === 'pitch'
          ? 'Выберите или введите значение для тега sport'
          : 'Выберите или введите значение для тега residential'
      )
      return
    }

    const key = objectKey(session.currentObject.id, session.currentObject.type)
    setFormStateByObjectId((prev) => ({
      ...prev,
      [key]: {
        selectedSports,
        customSport,
        selectedResidential,
        customResidential,
      },
    }))
    const newChanges: PendingChange[] = [
      ...changes,
      { object: session.currentObject, tagKey, tagValue },
    ]
    setChanges(newChanges)
    setSelectedSports([])
    setCustomSport('')
    setSelectedResidential('')
    setCustomResidential('')

    if (session.currentIndex < session.objects.length - 1) {
      const nextIndex = session.currentIndex + 1
      session.setCurrentIndex(nextIndex)
    } else {
      handleFinish(newChanges)
    }
  }

  const handleSkip = () => {
    if (!session?.currentObject) return

    const key = objectKey(session.currentObject.id, session.currentObject.type)
    setFormStateByObjectId((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
    const changesWithoutCurrent = changes.filter(
      (c) => c.object.id !== session.currentObject!.id || c.object.type !== session.currentObject!.type
    )
    setChanges(changesWithoutCurrent)
    setSelectedSports([])
    setCustomSport('')
    setSelectedResidential('')
    setCustomResidential('')

    if (session.currentIndex < session.objects.length - 1) {
      session.setCurrentIndex(session.currentIndex + 1)
    } else {
      if (changesWithoutCurrent.length > 0) {
        handleFinish(changesWithoutCurrent)
      } else {
        alert('Все объекты обработаны. Нет изменений для сохранения.')
        navigate('/search')
      }
    }
  }

  const resetFormAndGoTo = (index: number) => {
    saveFormForCurrentObject()
    session?.setCurrentIndex(index)
  }

  const handleFinish = async (overrideChanges?: PendingChange[]) => {
    const changesToSave = overrideChanges ?? changes
    if (changesToSave.length === 0) {
      alert('Нет изменений для сохранения')
      return
    }
    if (!token || !session) return

    setIsSubmitting(true)
    try {
      await saveChangesToOSM(changesToSave, session.editMode, token)
      alert(`Изменения сохранены в OSM! Обработано объектов: ${changesToSave.length}`)
      navigate('/search')
    } catch (error) {
      console.error('Error saving changes:', error)
      alert('Ошибка при сохранении изменений')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!session) {
    return (
      <div className="edit-page">
        <div className="no-objects">Объекты не найдены</div>
      </div>
    )
  }

  const { objects, currentIndex, editMode, currentObject, setCurrentIndex } = session

  if (!currentObject) {
    return (
      <div className="edit-page">
        <div className="no-objects">Объекты не найдены</div>
      </div>
    )
  }

  return (
    <div className="edit-page">
      <EditHeader
        currentIndex={currentIndex}
        totalCount={objects.length}
        object={currentObject}
        onPrev={() => resetFormAndGoTo(currentIndex - 1)}
        onNext={() => resetFormAndGoTo(currentIndex + 1)}
        canGoPrev={currentIndex > 0}
        canGoNext={currentIndex < objects.length - 1}
      />
      <div className="edit-grid">
        <div className="map-cell map-top-left">
          <MapContainer
            center={DEFAULT_MAP_CENTER}
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
            center={DEFAULT_MAP_CENTER}
            zoom={initialZoom}
            maxZoom={25}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; Esri'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxNativeZoom={esriMaxZoom}
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
            center={DEFAULT_MAP_CENTER}
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
          <TagForm
            editMode={editMode}
            selectedSports={selectedSports}
            customSport={customSport}
            selectedResidential={selectedResidential}
            customResidential={customResidential}
            onSportToggle={handleSportToggle}
            onResidentialSelect={handleResidentialSelect}
            onCustomSportChange={setCustomSport}
            onCustomResidentialChange={setCustomResidential}
            onConfirm={handleConfirm}
            onSkip={handleSkip}
            onFinish={() => handleFinish()}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  )
}

export default EditPage
