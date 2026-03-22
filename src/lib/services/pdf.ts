import { Buffer } from 'buffer'

export interface ExtractedText {
  text: string
  pageCount: number
  metadata: {
    title?: string
    author?: string
    subject?: string
    creator?: string
    producer?: string
    creationDate?: Date
    modificationDate?: Date
  }
}

export interface TextExtractionOptions {
  includeMetadata?: boolean
  normalizeWhitespace?: boolean
  preserveLineBreaks?: boolean
}

export class PDFService {
  /**
   * Extract text from PDF buffer
   * Note: This is a browser-compatible implementation
   * For production, you'd want to use pdf-parse on the server side
   */
  async extractTextFromPDF(
    buffer: Buffer | ArrayBuffer,
    options: TextExtractionOptions = {}
  ): Promise<ExtractedText> {
    try {
      // For browser implementation, we'll use a simplified approach
      // In production, this would use pdf-parse or similar library
      
      const arrayBuffer = buffer instanceof Buffer ? buffer.buffer : buffer as ArrayBuffer
      
      // Mock implementation - in production, use actual PDF parsing
      const extractedText = await this.mockPDFExtraction(arrayBuffer as ArrayBuffer, options)
      
      return extractedText
    } catch (error) {
      console.error('Error extracting text from PDF:', error)
      throw new Error('Failed to extract text from PDF')
    }
  }

  /**
   * Extract text from PDF file
   */
  async extractTextFromPDFFile(
    file: File,
    options: TextExtractionOptions = {}
  ): Promise<ExtractedText> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer
          const result = await this.extractTextFromPDF(arrayBuffer, options)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = () => {
        reject(new Error('Failed to read PDF file'))
      }
      
      reader.readAsArrayBuffer(file)
    })
  }

  /**
   * Validate PDF file
   */
  validatePDFFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (!file.type.toLowerCase().includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      return { valid: false, error: 'File must be a PDF' }
    }

    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 50MB' }
    }

    // Check file signature
    return new Promise<{ valid: boolean; error?: string }>((resolve) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const array = new Uint8Array(event.target?.result as ArrayBuffer)
        const pdfSignature = [0x25, 0x50, 0x44, 0x46] // %PDF
        
        const isValid = array.length >= 4 && 
          pdfSignature.every((byte, index) => array[index] === byte)
        
        resolve(isValid ? { valid: true } : { valid: false, error: 'Invalid PDF file' })
      }
      
      reader.onerror = () => {
        resolve({ valid: false, error: 'Failed to read file' })
      }
      
      reader.readAsArrayBuffer(file.slice(0, 4))
    }) as Promise<{ valid: boolean; error?: string }>
  }

  /**
   * Split text into pages (mock implementation)
   */
  splitTextIntoPages(text: string): string[] {
    // Simple page splitting based on form feed characters
    // In production, this would be more sophisticated
    return text.split('\f').filter(page => page.trim().length > 0)
  }

  /**
   * Extract text by page number
   */
  extractTextByPage(text: string, pageNumber: number): string {
    const pages = this.splitTextIntoPages(text)
    return pages[pageNumber] || ''
  }

  /**
   * Search for text in PDF content
   */
  searchText(text: string, query: string, options: {
    caseSensitive?: boolean
    wholeWord?: boolean
    regex?: boolean
  } = {}): Array<{ page: number; line: number; text: string; index: number }> {
    const { caseSensitive = false, wholeWord = false, regex = false } = options
    const pages = this.splitTextIntoPages(text)
    const results: Array<{ page: number; line: number; text: string; index: number }> = []

    const searchPattern = regex 
      ? new RegExp(query, caseSensitive ? 'g' : 'gi')
      : wholeWord 
        ? new RegExp(`\\b${query}\\b`, caseSensitive ? 'g' : 'gi')
        : new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), caseSensitive ? 'g' : 'gi')

    pages.forEach((page, pageIndex) => {
      const lines = page.split('\n')
      
      lines.forEach((line, lineIndex) => {
        let match
        while ((match = searchPattern.exec(line)) !== null) {
          results.push({
            page: pageIndex + 1,
            line: lineIndex + 1,
            text: match[0],
            index: match.index
          })
        }
      })
    })

    return results
  }

  /**
   * Get PDF metadata (mock implementation)
   */
  async getPDFMetadata(file: File): Promise<ExtractedText['metadata']> {
    try {
      const result = await this.extractTextFromPDFFile(file, { includeMetadata: true })
      return result.metadata
    } catch (error) {
      console.error('Error extracting PDF metadata:', error)
      return {}
    }
  }

  /**
   * Mock PDF extraction for development
   * In production, replace with actual PDF parsing library
   */
  private async mockPDFExtraction(
    arrayBuffer: ArrayBuffer,
    options: TextExtractionOptions
  ): Promise<ExtractedText> {
    // This is a mock implementation for development
    // In production, you would use pdf-parse or similar library
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockText = `
CONTRACT AGREEMENT

This agreement is made on January 15, 2024

PARTIES:
Owner: Downtown Development Corporation
Contractor: Quality Construction Services
Architect: Modern Design Architects

PROJECT DETAILS:
Project Name: Downtown Tower Renovation
Contract Sum: $450,000
Project Duration: 12 months
Start Date: February 1, 2024
Completion Date: January 31, 2025

PAYMENT TERMS:
1. Contract Sum: $450,000.00
2. Retainage: 5% of each progress payment
3. Payment Schedule: Monthly progress payments
4. Payment Due: 15th of each month
5. Net Payment Terms: 30 days

RETAINAGE TERMS:
- Retainage Rate: 5%
- Retainage Release: Upon substantial completion
- Final Retainage Release: 30 days after final completion

INSURANCE REQUIREMENTS:
- General Liability: $1,000,000
- Worker's Compensation: As required by law
- Auto Liability: $500,000

LIEN WAIVERS:
- Conditional lien waivers required with each payment
- Unconditional lien waiver required for final payment

CHANGE ORDERS:
- Change orders must be in writing
- Pricing to be agreed upon before work begins
- No oral change orders will be accepted

This agreement constitutes the entire understanding between the parties.
        `.trim()

        let processedText = mockText
        
        if (options.normalizeWhitespace) {
          processedText = processedText.replace(/\s+/g, ' ').trim()
        }

        if (!options.preserveLineBreaks) {
          processedText = processedText.replace(/\n+/g, ' ').trim()
        }

        resolve({
          text: processedText,
          pageCount: 1,
          metadata: {
            title: 'Contract Agreement',
            author: 'Legal Department',
            subject: 'Construction Contract',
            creator: 'PaySimple',
            producer: 'PaySimple PDF Generator',
            creationDate: new Date(),
            modificationDate: new Date()
          }
        })
      }, 100) // Simulate processing time
    })
  }

  /**
   * Convert PDF to images (for preview)
   * Note: This would require additional libraries in production
   */
  async convertPDFToImages(
    file: File,
    options: {
      scale?: number
      quality?: number
      format?: 'png' | 'jpeg'
    } = {}
  ): Promise<string[]> {
    // Mock implementation - in production use pdf2pic or similar
    return new Promise((resolve) => {
      setTimeout(() => {
        // Return placeholder image URLs
        resolve([
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
        ])
      }, 200)
    })
  }

  /**
   * Get PDF statistics
   */
  getPDFStatistics(text: string): {
    wordCount: number
    characterCount: number
    pageCount: number
    lineCount: number
  } {
    const pages = this.splitTextIntoPages(text)
    const lines = text.split('\n')
    const words = text.split(/\s+/).filter(word => word.length > 0)

    return {
      wordCount: words.length,
      characterCount: text.length,
      pageCount: pages.length,
      lineCount: lines.length
    }
  }
}

export const pdfService = new PDFService()
