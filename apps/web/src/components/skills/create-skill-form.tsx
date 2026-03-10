import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCreateSkill } from '@/hooks/use-skills'

interface CreateSkillFormProps {
  projectId: string
  onClose: () => void
}

export function CreateSkillForm({ projectId, onClose }: CreateSkillFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')
  const createSkill = useCreateSkill(projectId)

  function resetForm() {
    setName('')
    setDescription('')
    setCategory('')
    setTags('')
    onClose()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsedTags = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    createSkill.mutate(
      {
        name: name.trim(),
        description: description.trim(),
        category: category.trim(),
        tags: parsedTags.length > 0 ? parsedTags : undefined,
      },
      { onSuccess: resetForm },
    )
  }

  return (
    <div className="mx-auto mb-6 max-w-lg rounded-lg border bg-card p-6 shadow-sm">
      <h4 className="mb-4 text-base font-semibold">Create Skill</h4>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="skill-name" className="mb-1 block text-sm font-medium">
            Name
          </label>
          <input
            id="skill-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Code Review"
          />
        </div>
        <div>
          <label htmlFor="skill-description" className="mb-1 block text-sm font-medium">
            Description
          </label>
          <input
            id="skill-description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Brief description..."
          />
        </div>
        <div>
          <label htmlFor="skill-category" className="mb-1 block text-sm font-medium">
            Category
          </label>
          <input
            id="skill-category"
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Engineering"
          />
        </div>
        <div>
          <label htmlFor="skill-tags" className="mb-1 block text-sm font-medium">
            Tags (comma-separated)
          </label>
          <input
            id="skill-tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="quality, review, automation"
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={createSkill.isPending}>
            {createSkill.isPending ? 'Creating...' : 'Create'}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
