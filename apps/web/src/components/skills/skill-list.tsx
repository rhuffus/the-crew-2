import type { SkillDto } from '@the-crew/shared-types'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SkillListProps {
  skills: SkillDto[]
  onDelete: (id: string) => void
}

export function SkillList({ skills, onDelete }: SkillListProps) {
  if (skills.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">
          No skills yet. Create your first skill to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tags</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Roles</th>
            <th className="w-12 px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {skills.map((skill) => (
            <tr key={skill.id} className="hover:bg-muted/30">
              <td className="px-4 py-3 font-medium">{skill.name}</td>
              <td className="px-4 py-3">{skill.category}</td>
              <td className="max-w-xs truncate px-4 py-3">
                {skill.tags.length > 0 ? skill.tags.join(', ') : '\u2014'}
              </td>
              <td className="px-4 py-3">{skill.compatibleRoleIds.length}</td>
              <td className="px-4 py-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(skill.id)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
