declare module '@pyyupsk/fonts' {}
declare module '@pyyupsk/fonts?url' {
  const url: string
  export default url
}
declare module '@pyyupsk/fonts/meta' {
  export const fonts: Record<
    string,
    {
      family: string
      variable: string
      cssVar: string
      weights: (number | 'variable')[]
    }
  >
}
