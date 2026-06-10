export const VIRTUAL_ID = '@pyyupsk/fonts'
export const RESOLVED_ID = '\0@pyyupsk/fonts.css'
export const META_VIRTUAL_ID = '@pyyupsk/fonts/meta'
export const META_RESOLVED_ID = '\0@pyyupsk/fonts-meta.js'

export function handleResolveId(id: string): string | undefined {
  if (id === VIRTUAL_ID) return RESOLVED_ID
  if (id === META_VIRTUAL_ID) return META_RESOLVED_ID
  return undefined
}
