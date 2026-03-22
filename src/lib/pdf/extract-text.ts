import { pdfService, ExtractedText, TextExtractionOptions } from '@/lib/services/pdf'

/**
 * Extract text from PDF buffer
 * This is a wrapper around the PDF service for backward compatibility
 */
export async function extractTextFromPDF(
  buffer: Buffer | ArrayBuffer,
  options: TextExtractionOptions = {}
): Promise<ExtractedText> {
  return await pdfService.extractTextFromPDF(buffer, options)
}

/**
 * Extract text from PDF file
 */
export async function extractTextFromPDFFile(
  file: File,
  options: TextExtractionOptions = {}
): Promise<ExtractedText> {
  return await pdfService.extractTextFromPDFFile(file, options)
}

/**
 * Validate PDF file
 */
export function validatePDFFile(file: File): Promise<{ valid: boolean; error?: string }> {
  return pdfService.validatePDFFile(file)
}

/**
 * Get PDF statistics
 */
export function getPDFStatistics(text: string) {
  return pdfService.getPDFStatistics(text)
}

/**
 * Search text in PDF
 */
export function searchTextInPDF(
  text: string,
  query: string,
  options?: {
    caseSensitive?: boolean
    wholeWord?: boolean
    regex?: boolean
  }
) {
  return pdfService.searchText(text, query, options)
}

/**
 * Split text into pages
 */
export function splitTextIntoPages(text: string): string[] {
  return pdfService.splitTextIntoPages(text)
}

/**
 * Extract text by page number
 */
export function extractTextByPage(text: string, pageNumber: number): string {
  return pdfService.extractTextByPage(text, pageNumber)
}
