'use client'

import { useParams } from 'next/navigation'

export default function ReviewPage() {
  const params = useParams()
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Step 5: Review & Submit</h1>
      <p className="text-slate-600 mb-4">
        Pay Application ID: {params.id}
      </p>
      <div className="bg-slate/10 rounded-lg p-8 text-center">
        <p className="text-slate-600">
          Review & Submit page - Coming soon
        </p>
        <p className="text-sm text-slate/60 mt-2">
          This will merge Summary + Checks + Review Checklist + Finalize Confirm into one screen
        </p>
      </div>
    </div>
  )
}
