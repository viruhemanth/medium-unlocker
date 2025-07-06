import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    if (!url) {
      return NextResponse.json({ ok: false, error: 'No URL provided' }, { status: 400 })
    }
    // Validate URL format
    let parsedUrl
    try {
      parsedUrl = new URL(url)
    } catch {
      return NextResponse.json({ ok: false, error: 'Invalid URL format' }, { status: 400 })
    }
    // Try to fetch the URL (HEAD request) with browser-like headers
    try {
      const response = await fetch(parsedUrl.toString(), {
        method: 'HEAD',
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Connection': 'keep-alive',
        },
      })
      if (!response.ok) {
        return NextResponse.json({ ok: false, error: `Status: ${response.status}` }, { status: 400 })
      }
      return NextResponse.json({ ok: true })
    } catch (err) {
      return NextResponse.json({ ok: false, error: 'Could not reach the URL' }, { status: 400 })
    }
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 })
  }
}
