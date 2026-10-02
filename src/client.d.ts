declare module '@pyyupsk/fonts' {}
declare module '@pyyupsk/fonts?url' {
  const url: string
  export default url
}
declare module '@pyyupsk/fonts/meta' {
  export interface FontPreload {
    href: string
    type: 'font/woff2'
  }
  export const fonts: Record<
    string,
    {
      family: string
      variable: string
      cssVar: string
      weights: (number | 'variable')[]
      preloads: FontPreload[]
    }
  >
  /** Preload-selected font files of all families. */
  export const preloads: FontPreload[]
}
