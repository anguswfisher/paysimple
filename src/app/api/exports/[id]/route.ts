import { NextRequest, NextResponse } from 'next/server'
import { ExportService } from '@/lib/services/exports'

const exportService = new ExportService()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const exportJob = await exportService.getExportJob(params.id)
    return NextResponse.json(exportJob)
  } catch (error) {
    console.error('Error fetching export job:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch export job' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await exportService.deleteExportJob(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting export job:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete export job' },
      { status: 500 }
    )
  }
}
