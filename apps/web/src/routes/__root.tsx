import { createRootRoute, Outlet, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { ErrorBoundary } from '@/components/error-boundary'

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
})

function RootComponent() {
  return (
    <ErrorBoundary>
      <Outlet />
    </ErrorBoundary>
  )
}

function NotFoundComponent() {
  const { t } = useTranslation('navigation')
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground">{t('pageNotFound')}</h2>
        <p className="mt-2 text-muted-foreground">{t('pageNotFoundDescription')}</p>
        <Link to="/" className="mt-4 inline-block text-sm text-primary hover:underline">
          {t('goHome')}
        </Link>
      </div>
    </div>
  )
}
