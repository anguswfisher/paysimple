import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-warm-white">
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <Topbar />
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
