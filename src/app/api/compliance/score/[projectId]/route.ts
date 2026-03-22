import { NextRequest, NextResponse } from 'next/server'
import { ComplianceService } from '@/lib/services/compliance'

const complianceService = new ComplianceService()

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const score = await complianceService.calculateProjectScore(params.projectId)
    return NextResponse.json(score)
  } catch (error) {
    console.error('Error calculating compliance score:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to calculate compliance score' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const score = await complianceService.calculateProjectScore(params.projectId)
    return NextResponse.json(score)
  } catch (error) {
    console.error('Error fetching compliance score:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch compliance score' },
      { status: 500 }
    )
  }
}
