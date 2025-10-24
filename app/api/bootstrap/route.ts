import { auth } from '@clerk/nextjs/server'

export async function POST(req: Request) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  const template = process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE || 'backend'
  try {
    const payload = await req.json()
    const session = await auth()
    let token = await session.getToken({ template }).catch(() => null)
    // Fallback: accept client-provided bearer if present (still Clerk template token)
    if (!token) {
      const hdr = req.headers.get('authorization') || ''
      token = hdr.startsWith('Bearer ')? hdr.slice(7) : null
    }
    if (!token) {
      return Response.json({ message: 'not authenticated' }, { status: 401 })
    }
    const resp = await fetch(`${apiBase}/tenants/bootstrap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    })
    const text = await resp.text()
    let json: any
    try { json = JSON.parse(text) } catch { json = { message: text } }
    return new Response(JSON.stringify(json), { status: resp.status, headers: { 'Content-Type': 'application/json' } })
  } catch (e: any) {
    return Response.json({ message: e?.message || 'bootstrap failed' }, { status: 500 })
  }
}


