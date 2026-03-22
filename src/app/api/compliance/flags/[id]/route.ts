import { NextRequest, NextResponse } from 'next/server'
import { ComplianceService } from '@/lib/services/compliance'

const complianceService = new ComplianceService()

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { resolved, resolved_at, resolution_note } = body

    const resolution = {
      resolved,
      resolved_at: resolved_at || new Date().toISOString(),
      resolution_note
    }

    await complianceService.resolveFlag(params.id, resolution)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error resolving compliance flag:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to resolve compliance flag' },
      { status: 500 }
    )
  }
}
