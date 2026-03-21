'use client'

import { StepBar } from '@/components/layout/step-bar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Upload, FileText, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const steps = [
  { id: 'upload', name: 'Upload', href: '/projects/123/upload' },
  { id: 'extraction', name: 'Extraction', href: '/projects/123/extraction' },
  { id: 'review', name: 'Review', href: '/projects/123/review' },
  { id: 'schedule', name: 'Schedule', href: '/projects/123/schedule' },
  { id: 'compliance', name: 'Compliance', href: '/projects/123/compliance' },
  { id: 'export', name: 'Export', href: '/projects/123/export' },
]

export default function UploadPage() {
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'processing' | 'complete'>('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const router = useRouter()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploadState('uploading')
    
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200))
      setUploadProgress(i)
    }

    setUploadState('processing')
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setUploadState('complete')
    
    // Redirect to AI extraction page
    setTimeout(() => {
      router.push('/projects/123/extraction')
    }, 1000)
  }

  const resetUpload = () => {
    setUploadState('idle')
    setUploadProgress(0)
    setSelectedFile(null)
  }

  return (
    <div className="min-h-screen bg-concrete">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-navy border-b-2 border-steel/30">
        <div className="flex items-center gap-4">
          <div className="font-semibold text-base text-white tracking-tight">
            Pay<span className="text-steel">Simple</span>
          </div>
          <div className="text-xs text-white/50">
            Projects / <span className="text-white/85 font-medium">Office Building Construction</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="text-white/75 border-white/20 hover:bg-white/10">
            Save Draft
          </Button>
          <Button size="sm" className="bg-steel hover:bg-steel/90" disabled={uploadState !== 'idle'}>
            Continue to Review
          </Button>
        </div>
      </div>

      {/* Step Bar */}
      <StepBar steps={steps} currentStep="upload" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {uploadState === 'idle' && (
          <div className="w-full max-w-2xl">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-slate mb-2">Upload Your Contract</h1>
              <p className="text-slate/70">
                Upload your construction contract document for AI-powered payment term extraction
              </p>
            </div>

            <Card className="border-2 border-dashed border-neutral-300 bg-white">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-navy" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-slate mb-2">
                    {selectedFile ? selectedFile.name : 'Choose a file or drag and drop'}
                  </h3>
                  
                  <p className="text-sm text-neutral-500 mb-4">
                    PDF, DOC, DOCX files up to 50MB
                  </p>

                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileSelect}
                  />
                  
                  <label htmlFor="file-upload">
                    <Button variant="outline" className="cursor-pointer">
                      {selectedFile ? 'Change File' : 'Select File'}
                    </Button>
                  </label>

                  {selectedFile && (
                    <div className="mt-4 p-3 bg-concrete rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate" />
                          <span className="text-sm text-slate">{selectedFile.name}</span>
                        </div>
                        <span className="text-xs text-neutral-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {selectedFile && (
              <div className="mt-6 flex justify-center">
                <Button 
                  size="lg" 
                  onClick={handleUpload}
                  className="bg-steel hover:bg-steel/90 px-8"
                >
                  Start AI Extraction
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            <div className="mt-8 grid grid-cols-3 gap-4">
              <Card className="bg-white border border-neutral-200">
                <CardContent className="p-4 text-center">
                  <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate mb-1">Secure Upload</h4>
                  <p className="text-xs text-neutral-500">Your documents are encrypted and secure</p>
                </CardContent>
              </Card>

              <Card className="bg-white border border-neutral-200">
                <CardContent className="p-4 text-center">
                  <div className="w-8 h-8 bg-steel/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <AlertCircle className="w-4 h-4 text-steel" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate mb-1">AI-Powered</h4>
                  <p className="text-xs text-neutral-500">Advanced AI extracts payment terms automatically</p>
                </CardContent>
              </Card>

              <Card className="bg-white border border-neutral-200">
                <CardContent className="p-4 text-center">
                  <div className="w-8 h-8 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <FileText className="w-4 h-4 text-warning" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate mb-1">Multi-Format</h4>
                  <p className="text-xs text-neutral-500">Supports PDF, DOC, and DOCX files</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {(uploadState === 'uploading' || uploadState === 'processing') && (
          <div className="w-full max-w-md">
            <Card className="bg-white border border-neutral-200">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    {uploadState === 'uploading' ? (
                      <Upload className="w-8 h-8 text-navy animate-pulse" />
                    ) : (
                      <div className="w-8 h-8 border-4 border-steel border-t-transparent rounded-full animate-spin"></div>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-slate mb-2">
                    {uploadState === 'uploading' ? 'Uploading Document' : 'AI Processing'}
                  </h3>
                  
                  <p className="text-sm text-neutral-500 mb-4">
                    {uploadState === 'uploading' 
                      ? 'Your document is being uploaded securely...' 
                      : 'AI is extracting payment terms from your contract...'}
                  </p>

                  {uploadState === 'uploading' && (
                    <div className="space-y-2">
                      <Progress value={uploadProgress} className="h-2" />
                      <p className="text-xs text-neutral-500">{uploadProgress}% complete</p>
                    </div>
                  )}

                  {uploadState === 'processing' && (
                    <div className="space-y-2">
                      <div className="w-full h-2 bg-concrete rounded overflow-hidden">
                        <div className="h-full bg-steel rounded animate-pulse" style={{ width: '60%' }}></div>
                      </div>
                      <p className="text-xs text-neutral-500">Analyzing contract terms...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {uploadState === 'complete' && (
          <div className="w-full max-w-md">
            <Card className="bg-white border border-neutral-200">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-success" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-slate mb-2">
                    Extraction Complete!
                  </h3>
                  
                  <p className="text-sm text-neutral-500 mb-4">
                    AI successfully extracted payment terms from your contract
                  </p>

                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Terms Found:</span>
                      <span className="font-semibold text-slate">12</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Confidence:</span>
                      <span className="font-semibold text-success">94%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Processing Time:</span>
                      <span className="font-semibold text-slate">2.3s</span>
                    </div>
                  </div>

                  <Badge className="bg-success/10 text-success mb-4">
                    Redirecting to extraction review...
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
