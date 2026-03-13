import { render, type RenderResult } from '@testing-library/react'
import { RouterProvider, createRouter, createMemoryHistory } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routeTree } from '../routeTree.gen'
import type { ProjectSummary } from '@the-crew/shared-types'

/** Pre-seeded projects so ProjectProvider can resolve slugs in tests. */
const TEST_PROJECTS: ProjectSummary[] = [
  { id: 'acme-id', name: 'Acme Corp', description: 'Test project', status: 'active', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'p1', name: 'P1', description: 'Test project', status: 'active', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
]

export async function renderWithRouter(initialLocation = '/'): Promise<RenderResult> {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity },
    },
  })

  // Seed the projects query so ProjectProvider resolves slugs without fetching.
  queryClient.setQueryData(['projects'], TEST_PROJECTS)

  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialLocation] }),
  })

  // Pre-load lazy route components so the router renders synchronously.
  // Without this, autoCodeSplitting causes async route loading that can
  // exceed the default 1000ms findBy/waitFor timeout.
  await router.load()

  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}
