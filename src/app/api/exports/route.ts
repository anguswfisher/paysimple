import { NextRequest, NextResponse } from 'next/server'
import { ExportService } from '@/lib/services/exports'

const exportService = new ExportService()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse filters from query params
    const filters: any = {}
    if (searchParams.get('type')) filters.type = searchParams.get('type')
    if (searchParams.get('project_id')) filters.project_id = searchParams.get('project_id')
    if (searchParams.get('status')) filters.status = searchParams.get('status')
    if (searchParams.get('date_from')) filters.date_from = searchParams.get('date_from')
    if (searchParams.get('date_to')) filters.date_to = searchParams.get('date_to')

    const exports = await exportService.getExportHistory(filters)
    return NextResponse.json(exports)
  } catch (error) {
    console.error('Error fetching exports:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch exports' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, project_id } = body

    if (!type) {
      return NextResponse.json(
        { error: 'Export type is required' },
        { status: 400 }
      )
    }

    const validTypes = [
      'payment_schedule_pdf',
      'schedule_csv', 
      'compliance_pdf',
      'terms_docx',
      'payment_history_csv',
      'project_bundle'
    ]

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid export type' },
        { status: 400 }
      )
    }

    const exportJob = await exportService.createExportJob(type, project_id)
    return NextResponse.json(exportJob)
  } catch (error) {
    console.error('Error creating export job:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create export job' },
      { status: 500 }
    )
  }
}
