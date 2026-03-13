import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { ShellLayout } from '@/components/shell/shell-layout'
import { useProjects } from '@/hooks/use-projects'
import { ProjectList } from '@/components/projects/project-list'
import { Plus } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: PlatformHome,
})

function PlatformHome() {
  const { data: projects, isLoading, error } = useProjects()
  const { t } = useTranslation('navigation')
  const { t: tCommon } = useTranslation('common')

  return (
    <ShellLayout>
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-foreground">{t('projects')}</h2>
          <Link to="/projects/new" className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90" data-testid="new-project-btn">
            <Plus className="mr-1.5 h-4 w-4" />
            {t('newCompany')}
          </Link>
        </div>
        {isLoading && <p className="text-muted-foreground">{t('loadingProjects')}</p>}
        {error && <p className="text-destructive">{tCommon('error.loadFailed')}</p>}
        {projects && <ProjectList projects={projects} />}
      </div>
    </ShellLayout>
  )
}
