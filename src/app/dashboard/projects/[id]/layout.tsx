import { ProjectProvider } from '@/components/providers/project-provider'

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { id: string }
}) {
  // TODO: Fetch actual project data from Supabase
  const project = {
    id: params.id,
    name: "Downtown Tower Renovation",
    type: "Commercial Construction",
    status: "processing"
  }

  return (
    <ProjectProvider project={project}>
      {children}
    </ProjectProvider>
  )
}
