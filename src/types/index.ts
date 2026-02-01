export type EditMode = 'pitch' | 'residential'

export interface OverpassElement {
  type: 'node' | 'way' | 'relation'
  id: number
  version?: number
  changeset?: number
  timestamp?: string
  lat?: number
  lon?: number
  nodes?: number[]
  members?: Array<{ type: string; ref: number; role?: string }>
  tags?: Record<string, string>
}

export interface OverpassResponse {
  elements: OverpassElement[]
}

export interface OSMObject {
  id: string
  type: string
  version: string
  changeset: string
  timestamp: string
  json: OverpassElement
  fullJson: OverpassElement[]
}

export interface User {
  id: number
  username: string
  displayName: string
}

export type TagKeyForMode = 'sport' | 'residential'

export interface PendingChange {
  object: OSMObject
  tagKey: TagKeyForMode
  tagValue: string
}
