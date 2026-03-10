import { describe, it, expect } from 'vitest'
import { platformNavItems, projectNavItems, projectNavSections } from '../lib/navigation'

describe('navigation config', () => {
  it('should define platform nav items', () => {
    expect(platformNavItems).toHaveLength(1)
    expect(platformNavItems[0]!.label).toBe('Projects')
    expect(platformNavItems[0]!.to).toBe('/')
  })

  it('should define all domain module nav items', () => {
    const expectedLabels = [
      'Overview',
      'Company Model',
      'Departments',
      'Capabilities',
      'Roles',
      'Agents',
      'Skills',
      'Contracts',
      'Workflows',
      'Policies',
      'Releases',
      'Validations',
      'Audit',
    ]
    expect(projectNavItems.map((i) => i.label)).toEqual(expectedLabels)
  })

  it('should use parameterized project paths', () => {
    for (const item of projectNavItems) {
      expect(item.to).toContain('/projects/$projectId/')
    }
  })

  it('should group items into sections', () => {
    expect(projectNavSections).toHaveLength(3)
    expect(projectNavSections.map((s) => s.title)).toEqual([
      'General',
      'Design Studio',
      'Governance',
    ])
  })

  it('should have icons for all items', () => {
    for (const item of platformNavItems) {
      expect(item.icon).toBeDefined()
    }
    for (const item of projectNavItems) {
      expect(item.icon).toBeDefined()
    }
  })
})
