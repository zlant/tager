import type { User } from '../types'

export function parseOsmUserXml(userXml: string): User {
  const parser = new DOMParser()
  const doc = parser.parseFromString(userXml, 'text/xml')
  const userElement = doc.querySelector('user')
  if (!userElement) throw new Error('User data not found')
  const displayName = userElement.getAttribute('display_name') ?? ''
  return {
    id: parseInt(userElement.getAttribute('id') ?? '0', 10),
    username: displayName,
    displayName,
  }
}
