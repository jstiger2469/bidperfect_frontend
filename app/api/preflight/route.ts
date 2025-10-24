import { auth } from '@clerk/nextjs/server'

export async function GET() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  const template = process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE || 'backend'

  try {
    const session = await auth()
    const token = await session.getToken({ template }).catch(() => null)
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}

    const health = await fetch(`${apiBase}/health`).then(r => r.ok)
    const ctxRes = await fetch(`${apiBase}/me/context`, { headers }).catch(() => null)
    const ctx = ctxRes && ctxRes.ok ? await ctxRes.json() : null

    return Response.json({
      ok: true,
      template,
      apiBase,
      health,
      orgIdFromClerk: (session as any)?.orgId || null,
      orgIdFromToken: ctx?.orgId || null,
      companyIdFromToken: ctx?.companyId || null,
    })
  } catch (e: any) {
    return Response.json({ ok: false, error: e?.message || 'preflight failed' }, { status: 500 })
  }
}


