import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { useCreateProject } from '@/hooks/use-projects'
import { slugify } from '@/lib/slugify'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { GrowthPace, ApprovalLevel } from '@the-crew/shared-types'

type WizardStep = 1 | 2 | 3

export function CreateProjectForm() {
  const [step, setStep] = useState<WizardStep>(1)
  const { t } = useTranslation('forms')
  const { t: tCommon } = useTranslation('common')

  // Step 1: Required
  const [name, setName] = useState('')
  const [mission, setMission] = useState('')

  // Step 2: Optional
  const [companyType, setCompanyType] = useState('startup')
  const [vision, setVision] = useState('')

  // Step 3: Optional
  const [growthPace, setGrowthPace] = useState<GrowthPace>('moderate')
  const [approvalLevel, setApprovalLevel] = useState<ApprovalLevel>('structural-only')

  const createProject = useCreateProject()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    createProject.mutate(
      { name: name.trim(), description: mission.trim() },
      {
        onSuccess: (project) => {
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
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">{t('bootstrap.title')}</h3>
        <span className="text-xs text-muted-foreground">{t('bootstrap.stepOf', { step, total: 3 })}</span>
      </div>

      {/* Progress bar */}
      <div className="mb-4 flex gap-1">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`h-1 flex-1 rounded ${s <= step ? 'bg-primary' : 'bg-muted'}`} />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {step === 1 && (
          <>
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
              <label htmlFor="project-mission" className="mb-1 block text-sm font-medium">
                {t('bootstrap.mission')}
              </label>
              <textarea
                id="project-mission"
                value={mission}
                onChange={(e) => setMission(e.target.value)}
                required
                rows={2}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder={t('bootstrap.missionPlaceholder')}
              />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <label htmlFor="company-type" className="mb-1 block text-sm font-medium">
                {t('bootstrap.companyType')}
              </label>
              <select
                id="company-type"
                value={companyType}
                onChange={(e) => setCompanyType(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="startup">{t('companyType.startup')}</option>
                <option value="agency">{t('companyType.agency')}</option>
                <option value="saas">{t('companyType.saas')}</option>
                <option value="consultancy">{t('companyType.consultancy')}</option>
                <option value="marketplace">{t('companyType.marketplace')}</option>
                <option value="other">{t('companyType.other')}</option>
              </select>
            </div>
            <div>
              <label htmlFor="company-vision" className="mb-1 block text-sm font-medium">
                {t('bootstrap.vision')}
              </label>
              <textarea
                id="company-vision"
                value={vision}
                onChange={(e) => setVision(e.target.value)}
                rows={2}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder={t('bootstrap.visionPlaceholder')}
              />
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <label htmlFor="growth-pace" className="mb-1 block text-sm font-medium">
                {t('bootstrap.growthPace')}
              </label>
              <select
                id="growth-pace"
                value={growthPace}
                onChange={(e) => setGrowthPace(e.target.value as GrowthPace)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="conservative">{t('growthPace.conservative')}</option>
                <option value="moderate">{t('growthPace.moderate')}</option>
                <option value="aggressive">{t('growthPace.aggressive')}</option>
              </select>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('bootstrap.growthPaceDescription')}
              </p>
            </div>
            <div>
              <label htmlFor="approval-level" className="mb-1 block text-sm font-medium">
                {t('bootstrap.approvalLevel')}
              </label>
              <select
                id="approval-level"
                value={approvalLevel}
                onChange={(e) => setApprovalLevel(e.target.value as ApprovalLevel)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all-changes">{t('approvalLevel.all')}</option>
                <option value="structural-only">{t('approvalLevel.structural')}</option>
                <option value="budget-only">{t('approvalLevel.budget')}</option>
                <option value="none">{t('approvalLevel.none')}</option>
              </select>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('bootstrap.approvalLevelDescription')}
              </p>
            </div>
          </>
        )}

        <div className="flex gap-2">
          {step > 1 && (
            <Button type="button" variant="ghost" size="sm" onClick={() => setStep((s) => (s - 1) as WizardStep)}>
              <ChevronLeft className="mr-1 h-3 w-3" /> {tCommon('back')}
            </Button>
          )}
          {step < 3 && (
            <Button
              type="button"
              size="sm"
              onClick={() => setStep((s) => (s + 1) as WizardStep)}
              disabled={step === 1 && (!name.trim() || !mission.trim())}
            >
              {tCommon('next')} <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          )}
          {step === 3 && (
            <Button type="submit" size="sm" disabled={createProject.isPending}>
              {createProject.isPending ? t('bootstrap.bootstrapping') : t('bootstrap.bootstrapCompany')}
            </Button>
          )}
          <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
            {tCommon('cancel')}
          </Button>
        </div>
      </form>
    </div>
  )
}
