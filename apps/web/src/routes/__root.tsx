import { createRootRoute, Outlet, Link } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
})

function RootComponent() {
  return <Outlet />
}

function NotFoundComponent() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-muted-foreground">The page you are looking for does not exist.</p>
        <Link to="/" className="mt-4 inline-block text-sm text-primary hover:underline">
          Go to platform home
        </Link>
      </div>
    </div>
  )
}
