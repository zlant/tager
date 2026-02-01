import L from 'leaflet'

const ICON_BASE = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images'

export function initLeafletIcons(): void {
  delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: `${ICON_BASE}/marker-icon-2x.png`,
    iconUrl: `${ICON_BASE}/marker-icon.png`,
    shadowUrl: `${ICON_BASE}/marker-shadow.png`,
  })
}
