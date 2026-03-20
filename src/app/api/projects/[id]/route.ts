import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ project: { id: '123', name: 'Test Project' } })
}

export async function PATCH() {
  return NextResponse.json({ message: 'Project updated' })
}
