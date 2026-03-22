import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-0 ml-[215px]">
        <Topbar />
        <main className="flex-1 overflow-auto p-6 mt-[60px]">
          {children}
        </main>
      </div>
    </div>
  )
}
