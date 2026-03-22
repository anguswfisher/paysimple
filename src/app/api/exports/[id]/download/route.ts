import { NextRequest, NextResponse } from 'next/server'
import { ExportService } from '@/lib/services/exports'

const exportService = new ExportService()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { url, fileName } = await exportService.downloadExport(params.id)
    
    // Redirect to the signed URL
    return NextResponse.redirect(url)
  } catch (error) {
    console.error('Error downloading export:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to download export' },
      { status: 500 }
    )
  }
}
