import { render, type RenderResult } from '@testing-library/react'
import { RouterProvider, createRouter, createMemoryHistory } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routeTree } from '../routeTree.gen'

export async function renderWithRouter(initialLocation = '/'): Promise<RenderResult> {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

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
