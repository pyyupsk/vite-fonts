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
