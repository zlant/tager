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

/** Option with optional icon URL (e.g. from OSM wiki). */
export interface FormOption {
  value: string
  icon?: string
}

const WIKI_IMG = 'https://wiki.openstreetmap.org/wiki/Special:FilePath'

/** Options per edit mode: value + optional icon. Icons from https://wiki.openstreetmap.org/wiki/Key:roof:shape etc. */
export const OPTIONS_BY_MODE: Record<string, FormOption[]> = {
  pitch: [
    { value: 'basketball' },
    { value: 'tennis' },
    { value: 'volleyball' },
    { value: 'soccer' },
    { value: 'baseball' },
    { value: 'rugby' },
    { value: 'ice_hockey' },
    { value: 'futsal' },
    { value: 'beachvolleyball' },
    { value: 'american_football' },
    { value: 'cricket' },
  ],
  residential: [
    { value: 'urban' },
    { value: 'rural' },
    { value: 'apartments' },
    { value: 'detached' },
    { value: 'terrace' },
    { value: 'duplex' },
    { value: 'single_family' },
  ],
  roof_shape_apartments: [
    { value: 'gabled', icon: `${WIKI_IMG}/Roof_Gabled.png` },
    { value: 'flat', icon: `${WIKI_IMG}/Roof_Flat.png` },
    { value: 'hipped', icon: `${WIKI_IMG}/Roof_Hipped.png` },
    { value: 'pyramidal', icon: `${WIKI_IMG}/Roof_Pyramidal.png` },
    { value: 'skillion', icon: `${WIKI_IMG}/Roof_Skillion.png` },
    { value: 'half-hipped', icon: `${WIKI_IMG}/Roof_Half_Hipped.png` },
    { value: 'side_hipped', icon: `${WIKI_IMG}/Roof_Side_Hipped.png` },
    { value: 'round', icon: `${WIKI_IMG}/Roof_Round.png` },
    { value: 'gambrel', icon: `${WIKI_IMG}/Roof_Gambrel.png` },
  ],
}
