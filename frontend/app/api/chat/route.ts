import { type NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = 'https://aie-challenge-backend-eta.vercel.app/api/chat'

// Pull a human-readable reply out of whatever shape the backend returns.
function extractReply(data: unknown): string | null {
  if (typeof data === 'string') return data
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>
    for (const key of ['response', 'reply', 'message', 'answer', 'content', 'text', 'output']) {
      const value = obj[key]
      if (typeof value === 'string' && value.trim()) return value
    }
  }
  return null
}

export async function POST(req: NextRequest) {
  let message: string

  try {
    const body = await req.json()
    message = typeof body?.message === 'string' ? body.message.trim() : ''
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  if (!message) {
    return NextResponse.json({ error: 'Please enter a message.' }, { status: 400 })
  }

  try {
    const upstream = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    })

    const raw = await upstream.text()
    let parsed: unknown = raw
    try {
      parsed = JSON.parse(raw)
    } catch {
      // keep raw text
    }

    if (!upstream.ok) {
      const detail =
        (parsed && typeof parsed === 'object' && 'detail' in parsed
          ? JSON.stringify((parsed as Record<string, unknown>).detail)
          : raw) || 'Unknown error'
      console.log('[v0] Backend error:', upstream.status, detail)
      return NextResponse.json(
        { error: `The assistant is unavailable right now (status ${upstream.status}).` },
        { status: 502 },
      )
    }

    const reply = extractReply(parsed)
    if (!reply) {
      console.log('[v0] Could not extract reply from:', raw.slice(0, 500))
      return NextResponse.json(
        { error: 'Received an unexpected response from the assistant.' },
        { status: 502 },
      )
    }

    return NextResponse.json({ reply })
  } catch (error) {
    console.log('[v0] Fetch to backend failed:', error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: 'Could not reach the assistant. Please try again.' },
      { status: 502 },
    )
  }
}
