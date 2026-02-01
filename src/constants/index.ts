export const APP_VERSION = '0.1.0'
export const EDITOR_TAG = `tager ${APP_VERSION}`

export const STORAGE_KEYS = {
  MAP_POSITION: 'mapSearchPosition',
  EDIT_MODE: 'mapSearchEditMode',
  OSM_USER: 'osm_user',
} as const

export const SESSION_KEYS = {
  EDIT_MODE: 'edit_mode',
  OSM_FULL_JSON: 'osm_full_json',
  OSM_OBJECTS: 'osm_objects',
  CURRENT_INDEX: 'current_index',
} as const

export const DEFAULT_MAP_CENTER: [number, number] = [55.7558, 37.6173]
export const DEFAULT_MAP_ZOOM = 13

export const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter'
export const OSM_API_BASE = 'https://api.openstreetmap.org/api/0.6'
export const OSM_USER_URL = `${OSM_API_BASE}/user/details`

export const POPULAR_SPORTS = [
  'football', 'basketball', 'tennis', 'volleyball', 'soccer', 'baseball',
  'rugby', 'ice_hockey', 'badminton', 'table_tennis', 'handball', 'futsal',
  'beachvolleyball', 'american_football', 'cricket',
] as const

export const POPULAR_RESIDENTIAL = [
  'apartments', 'houses', 'detached', 'terrace', 'duplex', 'urban',
  'rural', 'dormitory',
] as const
