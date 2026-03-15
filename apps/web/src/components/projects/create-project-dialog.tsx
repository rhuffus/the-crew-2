import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { useCreateProject } from '@/hooks/use-projects'
import { slugify } from '@/lib/slugify'
import { bootstrapApi } from '@/lib/bootstrap-api'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

export function CreateProjectForm() {
  const { t } = useTranslation('forms')
  const { t: tCommon } = useTranslation('common')

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  const createProject = useCreateProject()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    createProject.mutate(
      { name: name.trim(), description: description.trim() },
      {
        onSuccess: async (project) => {
          let ceoAgentId: string | undefined
          try {
            const result = await bootstrapApi.bootstrap(project.id, {
              name: name.trim(),
              mission: description.trim(),
              companyType: 'startup',
            })
            ceoAgentId = result.ceoAgentId
          } catch {
            // Bootstrap failure is non-fatal; the org page will detect
            // an unbootstrapped project and can retry.
          }

          // Open chat as center view so the CEO conversation is visible on landing (VSR-008)
          useVisualWorkspaceStore.getState().openChatView(null, ceoAgentId)

          navigate({ to: '/projects/$projectSlug/org', params: { projectSlug: slugify(project.name) } })
        },
      },
    )
  }

  function handleCancel() {
    navigate({ to: '/' })
  }

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm" data-testid="create-project-wizard">
      <div className="mb-3">
        <h3 className="font-semibold">{t('bootstrap.title')}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{t('bootstrap.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="project-name" className="mb-1 block text-sm font-medium">
            {t('bootstrap.companyName')}
          </label>
          <input
            id="project-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder={t('bootstrap.companyNamePlaceholder')}
          />
        </div>
        <div>
          <label htmlFor="project-description" className="mb-1 block text-sm font-medium">
            {t('bootstrap.shortDescription')}
          </label>
          <textarea
            id="project-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={2}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder={t('bootstrap.shortDescriptionPlaceholder')}
          />
        </div>

        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}

        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={createProject.isPending || !name.trim() || !description.trim()}>
            {createProject.isPending ? t('bootstrap.creating') : t('bootstrap.createCompany')}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
            {tCommon('cancel')}
          </Button>
        </div>
      </form>
    </div>
  )
}
