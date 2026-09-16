import { DemoSidebar } from '@/components/demo/DemoSidebar'
import { DemoTopbar } from '@/components/demo/DemoTopbar'
import { Sparkles } from 'lucide-react'
import Link from 'next/link'

/**
 * Shell for the demo application.
 *
 * This is a route group — `(app)` does not appear in the URL — so the demo
 * intro at /demo stays outside the chrome while /demo/dashboard and everything
 * below it gets the full shell.
 *
 * Nothing here touches the real app: the demo tree reads from lib/demo/data
 * directly, with no auth, no Supabase, and no shared layout.
 */
export default function DemoAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen bg-gray-50 flex">
      <DemoSidebar />
      <div className="flex-1 min-w-0 flex flex-col min-h-0 ml-[215px]">
        <DemoTopbar />
        <main className="flex-1 min-w-0 flex flex-col min-h-0 overflow-auto mt-[60px]">
          <div className="px-6 pt-6">
            <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <p className="text-sm text-blue-900 flex-1 min-w-0">
                <span className="font-semibold">Demo.</span>{' '}
                <span className="text-blue-800/80">
                  Sample data for an example contractor. Nothing here is saved.
                </span>
              </p>
              <Link
                href="/"
                className="text-xs font-semibold text-blue-700 hover:text-blue-900 transition-colors shrink-0 rounded px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                Leave demo
              </Link>
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}
