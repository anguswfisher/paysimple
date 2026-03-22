import { supabase } from '@/lib/supabase/client'
import { ExportJob, ExportType, ExportStatus, ExportFilters, ExportTemplate } from '@/types/exports'

export class ExportService {
  async createExportJob(type: ExportType, projectId?: string): Promise<ExportJob> {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await (supabase
      .from('export_jobs') as any)
      .insert({
        user_id: user.id,
        project_id: projectId || null,
        export_type: type,
        status: 'pending',
        metadata: {
          created_at: new Date().toISOString()
        }
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating export job:', error)
      throw new Error('Failed to create export job')
    }

    // Start processing the export in the background
    this.processExportJob(data.id).catch(console.error)

    return data as ExportJob
  }

  async processExportJob(jobId: string): Promise<void> {
    try {
      // Update status to processing
      await (supabase
        .from('export_jobs') as any)
        .update({ status: 'processing' })
        .eq('id', jobId)

      // Get job details
      const { data: job } = await (supabase
        .from('export_jobs') as any)
        .select('*')
        .eq('id', jobId)
        .single()

      if (!job) {
        throw new Error('Export job not found')
      }

      let buffer: Buffer
      let fileName: string

      // Generate the appropriate file based on export type
      switch (job.export_type) {
        case 'payment_schedule_pdf':
          if (!job.project_id) throw new Error('Project ID required for payment schedule PDF')
          buffer = await this.generatePaymentSchedulePDF(job.project_id)
          fileName = `payment-schedule-${job.project_id}.pdf`
          break

        case 'schedule_csv':
          if (!job.project_id) throw new Error('Project ID required for schedule CSV')
          buffer = await this.generateScheduleCSV(job.project_id)
          fileName = `schedule-of-values-${job.project_id}.csv`
          break

        case 'compliance_pdf':
          if (!job.project_id) throw new Error('Project ID required for compliance PDF')
          buffer = await this.generateComplianceReport(job.project_id)
          fileName = `compliance-report-${job.project_id}.pdf`
          break

        case 'terms_docx':
          if (!job.project_id) throw new Error('Project ID required for terms DOCX')
          buffer = await this.generateContractTerms(job.project_id)
          fileName = `contract-terms-${job.project_id}.docx`
          break

        case 'payment_history_csv':
          if (!job.project_id) throw new Error('Project ID required for payment history CSV')
          buffer = await this.generatePaymentHistory(job.project_id)
          fileName = `payment-history-${job.project_id}.csv`
          break

        case 'project_bundle':
          if (!job.project_id) throw new Error('Project ID required for project bundle')
          buffer = await this.generateProjectBundle(job.project_id)
          fileName = `project-bundle-${job.project_id}.zip`
          break

        default:
          throw new Error(`Unsupported export type: ${job.export_type}`)
      }

      // Upload to storage
      const storagePath = `exports/${job.user_id}/${jobId}/${fileName}`
      const fileUrl = await this.uploadToStorage(buffer, storagePath)

      // Update job with completion info
      await (supabase
        .from('export_jobs') as any)
        .update({
          status: 'completed',
          file_url: fileUrl,
          file_size: buffer.length,
          file_name: fileName,
          completed_at: new Date().toISOString()
        })
        .eq('id', jobId)

    } catch (error) {
      console.error('Error processing export job:', error)
      
      // Update job with error info
      await (supabase
        .from('export_jobs') as any)
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          completed_at: new Date().toISOString()
        })
        .eq('id', jobId)
    }
  }

  async getExportHistory(filters?: ExportFilters): Promise<ExportJob[]> {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    let query = (supabase
      .from('export_jobs_details') as any)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters) {
      if (filters.type) {
        query = query.eq('export_type', filters.type)
      }
      if (filters.project_id) {
        query = query.eq('project_id', filters.project_id)
      }
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from)
      }
      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to)
      }
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching export history:', error)
      throw new Error('Failed to fetch export history')
    }

    return data || []
  }

  async getExportJob(jobId: string): Promise<ExportJob> {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await (supabase
      .from('export_jobs_details') as any)
      .select('*')
      .eq('id', jobId)
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching export job:', error)
      throw new Error('Export job not found')
    }

    return data as ExportJob
  }

  async downloadExport(jobId: string): Promise<{ url: string; fileName: string }> {
    const job = await this.getExportJob(jobId)

    if (!job.file_url) {
      throw new Error('Export file not available')
    }

    if (job.status !== 'completed') {
      throw new Error('Export not completed yet')
    }

    // Generate signed URL for download (valid for 1 hour)
    const { data, error } = await supabase.storage
      .from('exports')
      .createSignedUrl(job.file_url, 3600)

    if (error) {
      console.error('Error generating download URL:', error)
      throw new Error('Failed to generate download URL')
    }

    return {
      url: data.signedUrl,
      fileName: job.file_name || `export-${jobId}`
    }
  }

  async getExportTemplates(): Promise<ExportTemplate[]> {
    const { data, error } = await (supabase
      .from('export_templates') as any)
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching export templates:', error)
      throw new Error('Failed to fetch export templates')
    }

    return data || []
  }

  async deleteExportJob(jobId: string): Promise<void> {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // Get job to delete file from storage
    const { data: job } = await (supabase
      .from('export_jobs') as any)
      .select('file_url')
      .eq('id', jobId)
      .eq('user_id', user.id)
      .single()

    if (job?.file_url) {
      // Delete file from storage
      await supabase.storage
        .from('exports')
        .remove([job.file_url])
    }

    // Delete job record
    const { error } = await (supabase
      .from('export_jobs') as any)
      .delete()
      .eq('id', jobId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting export job:', error)
      throw new Error('Failed to delete export job')
    }
  }

  // File generation methods (placeholders for now)
  private async generatePaymentSchedulePDF(projectId: string): Promise<Buffer> {
    // TODO: Implement PDF generation using a library like jsPDF or Puppeteer
    console.log('Generating payment schedule PDF for project:', projectId)
    return Buffer.from('PDF content placeholder')
  }

  private async generateScheduleCSV(projectId: string): Promise<Buffer> {
    // TODO: Implement CSV generation
    console.log('Generating schedule CSV for project:', projectId)
    return Buffer.from('CSV content placeholder')
  }

  private async generateComplianceReport(projectId: string): Promise<Buffer> {
    // TODO: Implement compliance report PDF generation
    console.log('Generating compliance report for project:', projectId)
    return Buffer.from('Compliance report content placeholder')
  }

  private async generateContractTerms(projectId: string): Promise<Buffer> {
    // TODO: Implement DOCX generation using a library like docx
    console.log('Generating contract terms DOCX for project:', projectId)
    return Buffer.from('DOCX content placeholder')
  }

  private async generatePaymentHistory(projectId: string): Promise<Buffer> {
    // TODO: Implement payment history CSV generation
    console.log('Generating payment history CSV for project:', projectId)
    return Buffer.from('Payment history CSV content placeholder')
  }

  private async generateProjectBundle(projectId: string): Promise<Buffer> {
    // TODO: Implement ZIP bundle generation using a library like jszip
    console.log('Generating project bundle ZIP for project:', projectId)
    return Buffer.from('ZIP bundle content placeholder')
  }

  private async uploadToStorage(buffer: Buffer, path: string): Promise<string> {
    const { error } = await supabase.storage
      .from('exports')
      .upload(path, buffer, {
        contentType: this.getContentType(path),
        upsert: false
      })

    if (error) {
      console.error('Error uploading to storage:', error)
      throw new Error('Failed to upload file to storage')
    }

    return path
  }

  private getContentType(path: string): string {
    const extension = path.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'pdf': return 'application/pdf'
      case 'csv': return 'text/csv'
      case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      case 'zip': return 'application/zip'
      default: return 'application/octet-stream'
    }
  }

  async cleanupOldExports(): Promise<void> {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // Delete exports older than 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const { data: oldExports } = await (supabase
      .from('export_jobs') as any)
      .select('id, file_url')
      .eq('user_id', user.id)
      .lt('created_at', thirtyDaysAgo)
      .eq('status', 'completed')

    if (oldExports && oldExports.length > 0) {
      // Delete files from storage
      const filesToDelete = oldExports
        .filter((job: any) => job.file_url)
        .map((job: any) => job.file_url)

      if (filesToDelete.length > 0) {
        await supabase.storage
          .from('exports')
          .remove(filesToDelete)
      }

      // Delete job records
      await (supabase
        .from('export_jobs') as any)
        .delete()
        .eq('user_id', user.id)
        .lt('created_at', thirtyDaysAgo)
    }
  }
}
