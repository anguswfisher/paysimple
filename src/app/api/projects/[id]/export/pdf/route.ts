import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    url: '/downloads/project-123-schedule.pdf',
    message: 'PDF generated successfully'
  })
}
