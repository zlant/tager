import { osmAuth } from 'osm-auth'

const OSM_OAUTH_CLIENT_ID = import.meta.env.VITE_OSM_OAUTH_CLIENT_ID ?? ''
const OSM_OAUTH_REDIRECT_URI = import.meta.env.VITE_OSM_OAUTH_REDIRECT_URI ||
  `${window.location.origin}${import.meta.env.BASE_URL}login`
const OSM_URL = 'https://www.openstreetmap.org'

// @ts-expect-error - osm-auth types are incomplete, but it's a function in runtime
export const auth = osmAuth({
  client_id: OSM_OAUTH_CLIENT_ID,
  redirect_uri: OSM_OAUTH_REDIRECT_URI,
  scope: 'read_prefs write_api',
  singlepage: true,
})

export const getAccessToken = (): string | null => {
  try {
    const token = localStorage.getItem(`${OSM_URL}oauth2_access_token`)
    return token ? token.replace(/"/g, '') : null
  } catch {
    return null
  }
}
