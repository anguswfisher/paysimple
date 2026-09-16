'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'

/**
 * Pay applications live under the same shell as the rest of the app.
 * Without this, clicking "Pay Applications" in the sidebar dropped the user
 * out of the app chrome entirely, with no navigation and no way back.
 *
 * Pages own their internal padding, so the wizard's split-pane can run
 * full-bleed while the list page pads itself.
 */
export default function PayApplicationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-0 ml-[215px]">
        <Topbar />
        <main className="flex-1 flex flex-col min-h-0 overflow-auto mt-[60px]">
          {children}
        </main>
      </div>
    </div>
  )
}
