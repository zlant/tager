import packageJson from '../../package.json'

export const APP_VERSION = packageJson.version
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
  'basketball', 'tennis', 'volleyball', 'soccer', 'baseball',
  'rugby', 'ice_hockey', 'futsal',
  'beachvolleyball', 'american_football', 'cricket',
] as const

export const POPULAR_RESIDENTIAL = [
  'urban', 'rural', 'apartments', 'detached', 'terrace',
  'duplex', 'single_family'
] as const

export const SPORT_LABELS_RU: Record<string, string> = {
  basketball: 'Баскетбол',
  tennis: 'Теннис',
  volleyball: 'Волейбол',
  soccer: 'Футбол',
  baseball: 'Бейсбол',
  rugby: 'Регби',
  ice_hockey: 'Хоккей на льду',
  futsal: 'Мини-футбол',
  beachvolleyball: 'Пляжный волейбол',
  american_football: 'Американский футбол',
  cricket: 'Крикет',
}

export const RESIDENTIAL_LABELS_RU: Record<string, string> = {
  urban: 'Городская застройка',
  rural: 'Сельская местность',
  apartments: 'Многоквартирные дома',
  detached: 'Частные дома',
  terrace: 'Террасная застройка',
  duplex: 'Двухквартирные дома',
  single_family: 'Одноквартирные дома',
}
