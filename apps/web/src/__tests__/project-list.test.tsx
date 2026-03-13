import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import {
  RouterProvider,
  createRouter,
  createMemoryHistory,
  createRootRoute,
  createRoute,
} from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProjectList } from '@/components/projects/project-list'
import type { ProjectSummary } from '@the-crew/shared-types'

function renderInContext(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const rootRoute = createRootRoute({ component: () => ui })
  const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/' })
  const projectSlugRoute = createRoute({ getParentRoute: () => rootRoute, path: '/projects/$projectSlug' })
  const routeTree = rootRoute.addChildren([indexRoute, projectSlugRoute])
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  return render(
    <QueryClientProvider client={queryClient}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <RouterProvider router={router as any} />
    </QueryClientProvider>,
  )
}

const mockProject: ProjectSummary = {
  id: '1',
  name: 'Acme Corp',
  description: 'A test company',
  status: 'active',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-03-01T00:00:00Z',
}

describe('ProjectList', () => {
  it('should show empty state when no projects', async () => {
    renderInContext(<ProjectList projects={[]} />)
    await waitFor(() => {
      expect(screen.getByText(/no projects yet/i)).toBeDefined()
    })
  })

  it('should render project cards', async () => {
    renderInContext(<ProjectList projects={[mockProject]} />)
    await waitFor(() => {
      expect(screen.getByText('Acme Corp')).toBeDefined()
    })
    expect(screen.getByText('A test company')).toBeDefined()
    expect(screen.getByText('active')).toBeDefined()
  })

  it('should link to slug-based project route', async () => {
    renderInContext(<ProjectList projects={[mockProject]} />)
    await waitFor(() => {
      expect(screen.getByText('Acme Corp')).toBeDefined()
    })
    const link = screen.getByText('Acme Corp').closest('a')
    expect(link).toBeDefined()
    expect(link!.getAttribute('href')).toBe('/projects/acme-corp')
  })

  it('should render multiple projects', async () => {
    const projects: ProjectSummary[] = [
      mockProject,
      { ...mockProject, id: '2', name: 'Beta Inc' },
    ]
    renderInContext(<ProjectList projects={projects} />)
    await waitFor(() => {
      expect(screen.getByText('Acme Corp')).toBeDefined()
    })
    expect(screen.getByText('Beta Inc')).toBeDefined()
  })
})
