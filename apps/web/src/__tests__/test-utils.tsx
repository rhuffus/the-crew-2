import { render, type RenderResult } from '@testing-library/react'
import { RouterProvider, createRouter, createMemoryHistory } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routeTree } from '../routeTree.gen'

export function renderWithRouter(initialLocation = '/'): RenderResult {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialLocation] }),
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}
