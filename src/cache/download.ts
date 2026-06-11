const ALLOWED_CONTENT_TYPES = ['font/woff2', 'application/octet-stream', 'application/font-woff2']

export async function downloadFont(url: string): Promise<[Error, null] | [null, Uint8Array]> {
  let res: Response

  try {
    res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    })
  } catch (e) {
    return [e instanceof Error ? e : new Error(String(e)), null]
  }

  if (!res.ok) {
    return [new Error(`Failed to download font: HTTP ${res.status} for ${url}`), null]
  }

  const contentType = res.headers.get('content-type') ?? ''
  const isWoff2 = ALLOWED_CONTENT_TYPES.some((t) => contentType.includes(t))

  if (!isWoff2) {
    return [
      new Error(`Unexpected content-type "${contentType}" for ${url}. Expected woff2 font.`),
      null,
    ]
  }

  const buffer = await res.arrayBuffer()
  return [null, new Uint8Array(buffer)]
}
