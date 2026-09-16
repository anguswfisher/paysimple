'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Upload, FileText, AlertCircle, CheckCircle, ArrowRight, Sparkles } from 'lucide-react'
import { AiProcessingSimulator } from '@/components/demo/AiProcessingSimulator'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { updateProject, updateProjectStatus } from '@/lib/database/projects'

export default function UploadPage() {
  const [uploadState, setUploadState] = useState<
    'idle' | 'uploading' | 'processing' | 'complete' | 'sample'
  >('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const projectId = params?.id

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) return

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Only PDF files are supported right now.')
      setSelectedFile(null)
      return
    }

    const maxFileSizeBytes = 50 * 1024 * 1024
    if (file.size > maxFileSizeBytes) {
      setErrorMessage('File exceeds 50MB limit.')
      setSelectedFile(null)
      return
    }

    setErrorMessage(null)
    setSelectedFile(file)
  }

  // Runs the scripted extraction against sample data instead of a real file,
  // so the workflow can be walked end to end without a contract to hand.
  const handleSampleContract = () => {
    setErrorMessage(null)
    setUploadState('sample')
  }

  const handleUpload = async () => {
    if (!selectedFile || !projectId) return

    setUploadState('uploading')
    setErrorMessage(null)
    setUploadProgress(10)

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('You must be signed in to upload contracts.')
      }

      const safeFileName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const storagePath = `${user.id}/${projectId}/${Date.now()}-${safeFileName}`

      setUploadProgress(35)

      const { error: uploadError } = await supabase.storage
        .from('contracts')
        .upload(storagePath, selectedFile, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'application/pdf',
        })

      if (uploadError) {
        throw new Error(uploadError.message)
      }

      setUploadProgress(70)

      const { data } = supabase.storage.from('contracts').getPublicUrl(storagePath)

      await updateProject(projectId, {
        contract_file_url: data.publicUrl,
      })

      await updateProjectStatus(projectId, 'processing')

      setUploadProgress(100)
      setUploadState('processing')
      await new Promise(resolve => setTimeout(resolve, 800))
      setUploadState('complete')

      setTimeout(() => {
        router.push(`/dashboard/projects/${projectId}/extraction`)
      }, 600)
    } catch (error) {
      setUploadState('idle')
      setUploadProgress(0)
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed. Please try again.')
    }
  }

  const resetUpload = () => {
    setUploadState('idle')
    setUploadProgress(0)
    setSelectedFile(null)
  }

  return (
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
                    PDF files up to 50MB
                  </p>

                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".pdf,application/pdf"
                    onChange={handleFileSelect}
                  />
                  
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Button variant="outline" asChild>
                      <span>{selectedFile ? 'Change File' : 'Select File'}</span>
                    </Button>
                  </label>

                  {!selectedFile && (
                    <div className="mt-5 pt-5 border-t border-dashed border-neutral-200">
                      <p className="text-xs text-neutral-500 mb-2.5">
                        No contract to hand?
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSampleContract}
                        className="border-steel/40 text-steel hover:bg-steel/5 hover:border-steel"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Use a sample contract
                      </Button>
                      <p className="text-[11px] text-neutral-400 mt-2">
                        Runs the extraction on an example project. Nothing is uploaded.
                      </p>
                    </div>
                  )}

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

                  {errorMessage && (
                    <p className="mt-4 text-sm text-red-600">{errorMessage}</p>
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
                  Upload PDF & Start Workflow
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

        {uploadState === 'sample' && (
          <div className="w-full max-w-2xl">
            <div className="rounded-2xl border border-neutral-200 bg-white p-8">
              <AiProcessingSimulator
                fileName="Sample — Northgate Medical Agreement.pdf"
                onComplete={() =>
                  router.push(`/dashboard/projects/${projectId}/extraction`)
                }
              />
            </div>
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setUploadState('idle')}
                className="text-sm font-medium text-neutral-500 hover:text-slate transition-colors rounded px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel"
              >
                Cancel
              </button>
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
                      ? 'Your PDF is being uploaded securely...' 
                      : 'Preparing extraction workflow...'}
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
                    Contract uploaded and workflow started successfully.
                  </p>

                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Upload:</span>
                      <span className="font-semibold text-success">Complete</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Project Status:</span>
                      <span className="font-semibold text-slate">Processing</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Next Step:</span>
                      <span className="font-semibold text-slate">Extraction Review</span>
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
  )
}
