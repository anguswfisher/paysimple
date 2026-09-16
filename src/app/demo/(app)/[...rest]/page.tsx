import Link from 'next/link'
import { Hammer, ArrowLeft } from 'lucide-react'

/**
 * Catch-all for demo routes that have not been built out yet.
 *
 * The demo sidebar mirrors the real app's navigation, so every destination
 * needs to land somewhere deliberate rather than a 404 while the demo tree
 * is filled in screen by screen.
 */
export default function DemoNotBuiltPage({ params }: { params: { rest: string[] } }) {
  const section = params.rest?.[0]
    ? params.rest[0].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'This screen'

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-sm">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <Hammer className="w-5 h-5 text-slate-400" />
        </div>
        <h1 className="text-base font-semibold text-slate-800 mb-1.5">
          {section} isn&apos;t in the demo yet
        </h1>
        <p className="text-sm text-slate-500 mb-5">
          The demo currently covers the dashboard, projects, contract analysis,
          and pay applications.
        </p>
        <Link
          href="/demo/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to demo dashboard
        </Link>
      </div>
    </div>
  )
}
