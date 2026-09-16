'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AiProcessingSimulator } from '@/components/demo/AiProcessingSimulator'
import { getDemoProject } from '@/lib/demo/data'
import {
  Upload,
  Sparkles,
  FileText,
  CheckCircle,
  AlertCircle,
  FileQuestion,
} from 'lucide-react'

export default function DemoUploadPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const projectId = params?.id
  const project = projectId ? getDemoProject(projectId) : null
  const [running, setRunning] = useState(false)

  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <FileQuestion className="w-5 h-5 text-slate-400" />
          </div>
          <h1 className="text-base font-semibold text-slate mb-1.5">Project not found</h1>
          <p className="text-sm text-slate/60 mb-5">This demo project does not exist.</p>
          <Link href="/demo/projects">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white">
              Back to projects
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 min-w-0 flex flex-col items-center justify-center p-8">
      {!running ? (
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate mb-2">Upload Your Contract</h1>
            <p className="text-slate/70">
              Upload your construction contract document for AI-powered payment term
              extraction
            </p>
            <p className="text-sm text-slate/45 mt-1">{project.name}</p>
          </div>

          <Card className="border-2 border-dashed border-neutral-300 bg-white">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-navy" />
                </div>

                <h3 className="text-lg font-semibold text-slate mb-2">
                  Choose a file or drag and drop
                </h3>
                <p className="text-sm text-neutral-500 mb-4">PDF files up to 50MB</p>

                <Button variant="outline" disabled title="File upload is disabled in the demo">
                  Select File
                </Button>

                <div className="mt-5 pt-5 border-t border-dashed border-neutral-200">
                  <p className="text-xs text-neutral-500 mb-2.5">No contract to hand?</p>
                  <Button
                    onClick={() => setRunning(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Use a sample contract
                  </Button>
                  <p className="text-[11px] text-neutral-400 mt-2">
                    Runs the extraction on an example project. Nothing is uploaded.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reassurance row, carried over from the real upload screen */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: CheckCircle,
                tone: 'bg-success/10 text-success',
                title: 'Secure Upload',
                body: 'Your documents are encrypted and secure',
              },
              {
                icon: AlertCircle,
                tone: 'bg-steel/10 text-steel',
                title: 'AI-Powered',
                body: 'Advanced AI extracts payment terms automatically',
              },
              {
                icon: FileText,
                tone: 'bg-warning/10 text-warning',
                title: 'Multi-Format',
                body: 'Supports PDF, DOC, and DOCX files',
              },
            ].map((item) => (
              <Card key={item.title} className="bg-white border border-neutral-200">
                <CardContent className="p-4 text-center">
                  <div
                    className={`w-8 h-8 ${item.tone.split(' ')[0]} rounded-full flex items-center justify-center mx-auto mb-2`}
                  >
                    <item.icon className={`w-4 h-4 ${item.tone.split(' ')[1]}`} />
                  </div>
                  <h4 className="text-sm font-semibold text-slate mb-1">{item.title}</h4>
                  <p className="text-xs text-neutral-500">{item.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="w-full max-w-2xl">
          <Card className="bg-white border border-neutral-200">
            <CardContent className="p-8">
              <AiProcessingSimulator
                fileName={`Sample — ${project.name}.pdf`}
                onComplete={() => router.push(`/demo/projects/${projectId}/extraction`)}
              />
            </CardContent>
          </Card>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setRunning(false)}
              className="text-sm font-medium text-neutral-500 hover:text-slate transition-colors rounded px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
