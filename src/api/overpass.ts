import type { EditMode, OverpassElement, OverpassResponse } from '../types'
import { OVERPASS_API_URL } from '../constants'

function buildOverpassQuery(bbox: string, editMode: EditMode): string {
  if (editMode === 'pitch') {
    return `
      [out:json][timeout:25];
      (
        way["leisure"="pitch"][!"sport"](${bbox});
        relation["leisure"="pitch"][!"sport"](${bbox});
      );
      (._;>;);
      out meta;
    `
  }
  return `
    [out:json][timeout:25];
    (
      way["landuse"="residential"][!"residential"](${bbox});
      relation["landuse"="residential"][!"residential"](${bbox});
    );
    (._;>;);
    out meta;
  `
}

function filterTargetElements(elements: OverpassElement[], editMode: EditMode): OverpassElement[] {
  if (editMode === 'pitch') {
    return [
      ...elements.filter((e) => e.type === 'way' && e.tags?.leisure === 'pitch' && !e.tags?.sport),
      ...elements.filter(
        (e) => e.type === 'relation' && e.tags?.leisure === 'pitch' && !e.tags?.sport
      ),
    ]
  }
  return [
    ...elements.filter(
      (e) => e.type === 'way' && e.tags?.landuse === 'residential' && !e.tags?.residential
    ),
    ...elements.filter(
      (e) =>
        e.type === 'relation' &&
        e.tags?.landuse === 'residential' &&
        !e.tags?.residential
    ),
  ]
}

export async function fetchOverpassElements(
  bounds: { getSouth: () => number; getWest: () => number; getNorth: () => number; getEast: () => number },
  editMode: EditMode
): Promise<OverpassResponse> {
  const bbox = `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`
  const query = buildOverpassQuery(bbox, editMode)
  const response = await fetch(OVERPASS_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
  })
  if (!response.ok) throw new Error('Failed to fetch data from Overpass')
  return response.json()
}

export function getTargetElements(data: OverpassResponse, editMode: EditMode): OverpassElement[] {
  return filterTargetElements(data.elements ?? [], editMode)
}
