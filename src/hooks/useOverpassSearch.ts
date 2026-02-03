import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { EditMode, OSMObject } from '../types'
import type L from 'leaflet'
import { fetchOverpassElements, getTargetElements } from '../api/overpass'
import { saveEditSession, setCurrentIndex as persistCurrentIndex } from '../utils/storage'
import { SESSION_KEYS } from '../constants'
import type { OverpassElement } from '../types'

export function useOverpassSearch(editMode: EditMode) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)

  const runSearch = useCallback(
    async (bounds: L.LatLngBounds) => {
      setIsLoading(true)
      try {
        const data = await fetchOverpassElements(bounds, editMode)
        const targetElements = getTargetElements(data, editMode)

        if (targetElements.length === 0) {
          alert(
            editMode === 'pitch' ? t('alerts.noResultsPitch') : t('alerts.noResultsResidential')
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
          saveEditSession(objects, allElements, editMode)
        } catch (e) {
          if (e instanceof DOMException && e.name === 'QuotaExceededError') {
            sessionStorage.removeItem(SESSION_KEYS.OSM_FULL_JSON)
            try {
              saveEditSession(objects, [], editMode)
            } catch {
              alert(t('alerts.tooManyObjects'))
              setIsLoading(false)
              return
            }
            alert(t('alerts.loadedWithoutGeometry'))
          } else {
            throw e
          }
        }
        navigate('/edit')
      } catch (error) {
        console.error('Error loading objects:', error)
        alert(t('alerts.loadError'))
      } finally {
        setIsLoading(false)
      }
    },
    [editMode, navigate, t]
  )

  return { isLoading, runSearch }
}

export function useEditSession(): {
  objects: OSMObject[]
  currentIndex: number
  editMode: EditMode
  setCurrentIndex: (index: number) => void
  currentObject: OSMObject | null
} | null {
  const [state, setState] = useState<{
    objects: OSMObject[]
    currentIndex: number
    editMode: EditMode
  } | null>(() => {
    const storedMode = sessionStorage.getItem(SESSION_KEYS.EDIT_MODE) as EditMode | null
    const storedObjects = sessionStorage.getItem(SESSION_KEYS.OSM_OBJECTS)
    const storedFullJson = sessionStorage.getItem(SESSION_KEYS.OSM_FULL_JSON)
    const storedIndex = sessionStorage.getItem(SESSION_KEYS.CURRENT_INDEX)
    if (storedMode !== 'pitch' && storedMode !== 'residential') return null
    if (!storedObjects) return null
    try {
      const parsed = JSON.parse(storedObjects) as Array<{
        id: string
        type: string
        version: string
        changeset: string
        timestamp: string
        json: OverpassElement
      }>
      const fullJson: OverpassElement[] = storedFullJson ? JSON.parse(storedFullJson) : []
      const objects: OSMObject[] = parsed.map((o) => ({ ...o, fullJson }))
      const currentIndex = storedIndex ? parseInt(storedIndex, 10) : 0
      return { objects, currentIndex, editMode: storedMode }
    } catch {
      return null
    }
  })

  const setCurrentIndex = useCallback((index: number) => {
    setState((prev) => {
      if (!prev) return prev
      persistCurrentIndex(index)
      return { ...prev, currentIndex: index }
    })
  }, [])

  if (!state) return null
  const currentObject = state.objects[state.currentIndex] ?? null
  return {
    ...state,
    setCurrentIndex,
    currentObject,
  }
}
