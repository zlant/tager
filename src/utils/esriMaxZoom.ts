const WORLD_IMAGERY_BASE =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'

const METADATA_LAYER_IDS = [8, 9, 10, 11, 12]

const FALLBACK_WHEN_EMPTY = 17
const MIN_ZOOM = 10
const MAX_ZOOM = 22

function wgs84ToWebMercator(lng: number, lat: number): { x: number; y: number } {
  const x = (lng * 20037508.34) / 180
  const y =
    Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)) *
    (20037508.34 / Math.PI)
  return { x, y }
}

interface QueryResponse {
  features?: Array<{ attributes?: Record<string, number> }>
  error?: { message?: string }
}

async function queryMetadataLayer(
  layerId: number,
  lng: number,
  lat: number
): Promise<number | null> {
  const { x, y } = wgs84ToWebMercator(lng, lat)
  const geometry = JSON.stringify({
    x,
    y,
    spatialReference: { wkid: 102100 },
  })
  const params = new URLSearchParams({
    f: 'json',
    geometryType: 'esriGeometryPoint',
    geometry,
    inSR: '102100',
    spatialRel: 'esriSpatialRelIntersects',
    returnGeometry: 'false',
    outFields: 'MaxMapLevel',
  })
  const url = `${WORLD_IMAGERY_BASE}/${layerId}/query?${params}`
  const res = await fetch(url)
  const data: QueryResponse = await res.json()
  if (data.error) return null
  const level = data.features?.[0]?.attributes?.MaxMapLevel
  return typeof level === 'number' ? level : null
}

export async function getEsriWorldImageryMaxZoom(
  lat: number,
  lng: number
): Promise<number> {
  const results = await Promise.all(
    METADATA_LAYER_IDS.map((id) => queryMetadataLayer(id, lng, lat))
  )
  const min = results.reduce<number | null>(
    (acc, val) =>
      val != null && (acc == null || val < acc) ? val : acc,
    null
  )
  if (min == null) return FALLBACK_WHEN_EMPTY
  const clamped = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, min))
  return clamped
}
