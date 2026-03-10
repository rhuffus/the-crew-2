import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useSkills, useDeleteSkill } from '@/hooks/use-skills'
import { SkillList } from '@/components/skills/skill-list'
import { CreateSkillForm } from '@/components/skills/create-skill-form'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export const Route = createFileRoute('/projects/$projectId/admin/skills')({
  component: SkillsPage,
})

function SkillsPage() {
  const { projectId } = Route.useParams()
  const { data: skills, isLoading, error } = useSkills(projectId)
  const deleteSkill = useDeleteSkill(projectId)
  const [showForm, setShowForm] = useState(false)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-medium text-foreground">Skills</h3>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            New Skill
          </Button>
        )}
      </div>
      {showForm && (
        <CreateSkillForm
          projectId={projectId}
          onClose={() => setShowForm(false)}
        />
      )}
      {isLoading && <p className="text-muted-foreground">Loading skills...</p>}
      {error && <p className="text-destructive">Failed to load skills.</p>}
      {skills && (
        <SkillList
          skills={skills}
          onDelete={(id) => deleteSkill.mutate(id)}
        />
      )}
    </div>
  )
}
