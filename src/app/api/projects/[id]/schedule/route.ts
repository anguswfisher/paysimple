import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    schedule: [
      { id: 1, description: 'Payment 1', amount: 37500, due_date: '2024-02-15' },
      { id: 2, description: 'Payment 2', amount: 37500, due_date: '2024-03-15' }
    ]
  })
}

export async function PATCH() {
  return NextResponse.json({ message: 'Schedule updated' })
}
