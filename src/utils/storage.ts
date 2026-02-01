import type { EditMode } from '../types'
import {
  STORAGE_KEYS,
  SESSION_KEYS,
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
} from '../constants'

export interface MapPosition {
  center: [number, number]
  zoom: number
}

export function loadSavedPosition(): MapPosition {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MAP_POSITION)
    if (!raw) return { center: DEFAULT_MAP_CENTER, zoom: DEFAULT_MAP_ZOOM }
    const { center, zoom } = JSON.parse(raw)
    if (!Array.isArray(center) || center.length !== 2 || typeof zoom !== 'number') {
      return { center: DEFAULT_MAP_CENTER, zoom: DEFAULT_MAP_ZOOM }
    }
    const [lat, lng] = center
    if (typeof lat !== 'number' || typeof lng !== 'number' || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return { center: DEFAULT_MAP_CENTER, zoom: DEFAULT_MAP_ZOOM }
    }
    return { center: [lat, lng], zoom: Math.min(25, Math.max(0, zoom)) }
  } catch {
    return { center: DEFAULT_MAP_CENTER, zoom: DEFAULT_MAP_ZOOM }
  }
}

export function savePosition(center: { lat: number; lng: number }, zoom: number): void {
  localStorage.setItem(
    STORAGE_KEYS.MAP_POSITION,
    JSON.stringify({ center: [center.lat, center.lng], zoom })
  )
}

export function loadSavedEditMode(): EditMode {
  const raw = localStorage.getItem(STORAGE_KEYS.EDIT_MODE)
  if (raw === 'pitch' || raw === 'residential') return raw
  return 'pitch'
}

export function saveEditMode(mode: EditMode): void {
  localStorage.setItem(STORAGE_KEYS.EDIT_MODE, mode)
}

export function saveEditSession(
  objects: Array<{ id: string; type: string; version: string; changeset: string; timestamp: string; json: unknown }>,
  fullJson: unknown[],
  editMode: EditMode
): void {
  sessionStorage.setItem(SESSION_KEYS.EDIT_MODE, editMode)
  sessionStorage.setItem(SESSION_KEYS.OSM_FULL_JSON, JSON.stringify(fullJson))
  sessionStorage.setItem(SESSION_KEYS.OSM_OBJECTS, JSON.stringify(objects))
  sessionStorage.setItem(SESSION_KEYS.CURRENT_INDEX, '0')
}

export function setCurrentIndex(index: number): void {
  sessionStorage.setItem(SESSION_KEYS.CURRENT_INDEX, index.toString())
}

export function getStoredEditMode(): EditMode | null {
  const raw = sessionStorage.getItem(SESSION_KEYS.EDIT_MODE)
  if (raw === 'pitch' || raw === 'residential') return raw
  return null
}

export function getStoredObjects(): string | null {
  return sessionStorage.getItem(SESSION_KEYS.OSM_OBJECTS)
}

export function getStoredFullJson(): string | null {
  return sessionStorage.getItem(SESSION_KEYS.OSM_FULL_JSON)
}

export function getStoredCurrentIndex(): string | null {
  return sessionStorage.getItem(SESSION_KEYS.CURRENT_INDEX)
}
