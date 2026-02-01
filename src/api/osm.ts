import type { EditMode, OverpassElement, OSMObject, PendingChange } from '../types'
import { EDITOR_TAG, OSM_API_BASE } from '../constants'

function escapeXml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function elementToOsmXml(
  el: OverpassElement,
  changesetId: string,
  tagKey: string,
  tagValue: string
): string {
  const tags = { ...el.tags, [tagKey]: tagValue }
  const v = el.version ?? 1
  const ts = el.timestamp ?? ''
  if (el.type === 'way') {
    let out = `  <way id="${el.id}" version="${v}" changeset="${changesetId}" timestamp="${ts}">\n`
    for (const ref of el.nodes ?? []) out += `    <nd ref="${ref}"/>\n`
    for (const [k, val] of Object.entries(tags)) out += `    <tag k="${escapeXml(k)}" v="${escapeXml(val)}"/>\n`
    out += '  </way>'
    return out
  }
  if (el.type === 'relation') {
    let out = `  <relation id="${el.id}" version="${v}" changeset="${changesetId}" timestamp="${ts}">\n`
    for (const m of el.members ?? []) out += `    <member type="${m.type}" ref="${m.ref}" role="${m.role ?? ''}"/>\n`
    for (const [k, val] of Object.entries(tags)) out += `    <tag k="${escapeXml(k)}" v="${escapeXml(val)}"/>\n`
    out += '  </relation>'
    return out
  }
  return ''
}

export function generateOSMChangeXML(changes: PendingChange[], changesetId: string): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<osmChange version="0.6" generator="${EDITOR_TAG}">
  <modify>
`
  for (const change of changes) {
    const part = elementToOsmXml(
      change.object.json,
      changesetId,
      change.tagKey,
      change.tagValue
    )
    if (part) xml += part + '\n'
  }
  xml += `  </modify>
</osmChange>`
  return xml
}

function getChangesetComment(editMode: EditMode): string {
  return editMode === 'pitch'
    ? 'Добавление тега sport для объектов leisure=pitch'
    : 'Добавление тега residential для объектов landuse=residential'
}

export async function createChangeset(token: string, editMode: EditMode): Promise<string> {
  const comment = getChangesetComment(editMode)
  const changesetXml = `<?xml version="1.0" encoding="UTF-8"?>
<osm>
  <changeset>
    <tag k="created_by" v="${EDITOR_TAG}"/>
    <tag k="comment" v="${escapeXml(comment)}"/>
  </changeset>
</osm>`

  const response = await fetch(`${OSM_API_BASE}/changeset/create`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'text/xml',
    },
    body: changesetXml,
  })
  if (!response.ok) throw new Error('Failed to create changeset')
  return response.text()
}

export async function closeChangeset(changesetId: string, token: string): Promise<void> {
  await fetch(`${OSM_API_BASE}/changeset/${changesetId}/close`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function uploadChanges(
  changesetId: string,
  osmChangeXml: string,
  token: string
): Promise<void> {
  const response = await fetch(`${OSM_API_BASE}/changeset/${changesetId}/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/xml',
    },
    body: osmChangeXml,
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `Upload failed: ${response.status}`)
  }
}

export async function saveChangesToOSM(
  changes: PendingChange[],
  editMode: EditMode,
  token: string
): Promise<void> {
  const changesetId = await createChangeset(token, editMode)
  try {
    const osmChangeXml = generateOSMChangeXML(changes, changesetId)
    await uploadChanges(changesetId, osmChangeXml, token)
  } finally {
    await closeChangeset(changesetId, token)
  }
}
