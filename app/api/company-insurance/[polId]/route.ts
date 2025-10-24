import { auth } from '@clerk/nextjs/server'

export async function PATCH(req: Request, { params }: { params: { polId: string } }) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  const template = process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE || 'backend'
  try {
    const body = await req.json().catch(() => ({})) as { companyId?: string; data?: any }
    const companyId = body.companyId
    const polId = params.polId
    if (!companyId || !polId) return Response.json({ message: 'companyId and polId required' }, { status: 400 })
    const session = await auth()
    let token = await session.getToken({ template }).catch(() => null)
    if (!token) {
      const hdr = req.headers.get('authorization') || ''
      token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null
    }
    if (!token) return Response.json({ message: 'not authenticated' }, { status: 401 })
    const resp = await fetch(`${apiBase}/companies/${companyId}/insurance/${polId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body.data || {}),
    })
    const text = await resp.text()
    let json: any
    try { json = JSON.parse(text) } catch { json = { message: text } }
    return new Response(JSON.stringify(json), { status: resp.status, headers: { 'Content-Type': 'application/json' } })
  } catch (e: any) {
    return Response.json({ message: e?.message || 'policy update proxy failed' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { polId: string } }) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  const template = process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE || 'backend'
  try {
    const url = new URL(req.url)
    const companyId = url.searchParams.get('companyId')
    const polId = params.polId
    if (!companyId || !polId) return Response.json({ message: 'companyId and polId required' }, { status: 400 })
    const session = await auth()
    let token = await session.getToken({ template }).catch(() => null)
    if (!token) {
      const hdr = req.headers.get('authorization') || ''
      token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null
    }
    if (!token) return Response.json({ message: 'not authenticated' }, { status: 401 })
    const resp = await fetch(`${apiBase}/companies/${companyId}/insurance/${polId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    const text = await resp.text()
    let json: any
    try { json = JSON.parse(text) } catch { json = { message: text } }
    return new Response(JSON.stringify(json), { status: resp.status, headers: { 'Content-Type': 'application/json' } })
  } catch (e: any) {
    return Response.json({ message: e?.message || 'policy delete proxy failed' }, { status: 500 })
  }
}




