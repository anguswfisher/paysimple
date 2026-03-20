import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    url: '/downloads/project-123-schedule.csv',
    message: 'CSV generated successfully'
  })
}
