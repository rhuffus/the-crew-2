import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { ProjectSummary } from '@the-crew/shared-types'
import { useProjects } from '@/hooks/use-projects'
import { slugify } from '@/lib/slugify'

export interface ProjectContextValue {
  project: ProjectSummary
  projectId: string
  projectName: string
  projectSlug: string
}

const ProjectContext = createContext<ProjectContextValue | null>(null)

interface ProjectProviderProps {
  slug: string
  children: ReactNode
}

export function ProjectProvider({ slug, children }: ProjectProviderProps) {
  const { data: projects, isLoading, error } = useProjects()

  const project = useMemo(() => {
    if (!projects) return null
    return projects.find((p) => slugify(p.name) === slug) ?? null
  }, [projects, slug])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading project...</p>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-destructive">Project not found.</p>
      </div>
    )
  }

  const value: ProjectContextValue = {
    project,
    projectId: project.id,
    projectName: project.name,
    projectSlug: slug,
  }

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useCurrentProject(): ProjectContextValue {
  const ctx = useContext(ProjectContext)
  if (!ctx) {
    throw new Error('useCurrentProject must be used within a ProjectProvider')
  }
  return ctx
}
