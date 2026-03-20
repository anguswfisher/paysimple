import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    flags: [
      { id: 1, severity: 'high', title: 'Missing lien waiver clause' },
      { id: 2, severity: 'medium', title: 'Retainage rate above 5%' }
    ],
    score: 94
  })
}
