/**
 * Astro middleware that injects the fonts stylesheet link into HTML responses.
 * Registered automatically by the Astro integration — do not call directly.
 *
 * @param _context - Astro request context (unused).
 * @param next - Next middleware handler.
 * @returns Modified response with stylesheet injected, or original response unchanged.
 */
export async function onRequest(
  _context: unknown,
  next: () => Promise<Response>,
): Promise<Response> {
  const response = await next()
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('text/html')) return response

  const html = await response.text()
  if (html.includes('/fonts.css')) return new Response(html, response)

  const modified = html.replace(
    '</head>',
    '  <link rel="stylesheet" href="/fonts.css" />\n  </head>',
  )
  return new Response(modified, response)
}
