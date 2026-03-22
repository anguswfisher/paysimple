import { NextRequest, NextResponse } from 'next/server'
import { ComplianceService } from '@/lib/services/compliance'

const complianceService = new ComplianceService()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const metrics = await complianceService.getComplianceMetrics(userId)
    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error fetching compliance metrics:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch compliance metrics' },
      { status: 500 }
    )
  }
}
