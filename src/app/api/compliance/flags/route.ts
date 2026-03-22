import { NextRequest, NextResponse } from 'next/server'
import { ComplianceService } from '@/lib/services/compliance'

const complianceService = new ComplianceService()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const projectId = searchParams.get('project_id')
    const severity = searchParams.get('severity')

    const flags = await complianceService.getComplianceFlags(
      projectId || undefined,
      severity || undefined
    )
    
    return NextResponse.json(flags)
  } catch (error) {
    console.error('Error fetching compliance flags:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch compliance flags' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId } = body

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    const flags = await complianceService.analyzeContract(projectId)
    return NextResponse.json(flags)
  } catch (error) {
    console.error('Error analyzing contract:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze contract' },
      { status: 500 }
    )
  }
}
