import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function POST(request: NextRequest) {
  try {
    // Get auth token
    const authResult = await auth()
    const { userId, getToken } = authResult
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = await getToken()
    if (!token) {
      return NextResponse.json(
        { error: 'No auth token' },
        { status: 401 }
      )
    }

    // Get the form data from the request
    const formData = await request.formData()
    
    // Forward to backend
    const backendResponse = await fetch(`${BACKEND_URL}/documents/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type - let fetch set it with boundary
      },
      body: formData,
    })

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      console.error('[API /documents/upload] Backend error:', backendResponse.status, errorText)
      
      return NextResponse.json(
        { error: errorText || 'Upload failed' },
        { status: backendResponse.status }
      )
    }

    const data = await backendResponse.json()
    return NextResponse.json(data)
    
  } catch (error: any) {
    console.error('[API /documents/upload] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

