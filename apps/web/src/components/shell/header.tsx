import { Link, useMatches } from '@tanstack/react-router'
import { ChevronRight, Sun, Moon, Monitor, User, Globe, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCurrentProject } from '@/providers/project-provider'
import { type Theme, useThemeStore } from '@/stores/theme-store'
import { useLanguageStore } from '@/stores/language-store'
import type { SupportedLanguage } from '@/i18n/config'

const LANGUAGE_OPTIONS: { code: SupportedLanguage; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
]

const themeOptions: { value: Theme; label: string; icon: React.ReactNode }[] = [
  { value: 'light', label: 'Light', icon: <Sun className="h-4 w-4" /> },
  { value: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" /> },
  { value: 'system', label: 'System', icon: <Monitor className="h-4 w-4" /> },
]

export function Header() {
  const breadcrumbs = useBreadcrumbs()
  const { t } = useTranslation('common')
  const { theme, setTheme } = useThemeStore()
  const { language, setLanguage } = useLanguageStore()

  let projectSlug: string | undefined
  try {
    const ctx = useCurrentProject()
    projectSlug = ctx.projectSlug
  } catch {
    // Not inside a project route
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
        {breadcrumbs.map((crumb, i) => (
          <span key={`${i}-${crumb.path}`} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
            {i < breadcrumbs.length - 1 ? (
              <Link to={crumb.path} className="text-muted-foreground hover:text-foreground">
                {crumb.label}
              </Link>
            ) : (
              <span className="font-medium text-foreground">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>
      <div className="flex items-center gap-2">
        {breadcrumbs.length > 1 && <Badge variant="warning">Draft</Badge>}
        {projectSlug && (
          <div className="flex rounded-md border border-border text-xs" data-testid="view-mode-toggle">
            <Link
              to="/projects/$projectSlug/org"
              params={{ projectSlug }}
              className="px-2 py-1 text-muted-foreground hover:text-foreground rounded-l-md"
            >
              Visual
            </Link>
            <span className="bg-primary px-2 py-1 font-medium text-primary-foreground rounded-r-md">
              Admin
            </span>
          </div>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              data-testid="user-menu-trigger"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              aria-label="User menu"
            >
              <User className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <Globe className="mr-1 inline h-3.5 w-3.5" />
              {t('language')}
            </DropdownMenuLabel>
            {LANGUAGE_OPTIONS.map((opt) => (
              <DropdownMenuItem
                key={opt.code}
                data-testid={`language-option-${opt.code}`}
                onClick={() => setLanguage(opt.code)}
                className={language === opt.code ? 'bg-accent' : ''}
              >
                {opt.label}
                {language === opt.code && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel>
              <Sun className="mr-1 inline h-3.5 w-3.5" />
              {t('theme')}
            </DropdownMenuLabel>
            {themeOptions.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                data-testid={`theme-${opt.value}`}
                onClick={() => setTheme(opt.value)}
                className={theme === opt.value ? 'bg-accent' : ''}
              >
                <span className="mr-2">{opt.icon}</span>
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

interface Breadcrumb {
  label: string
  path: string
}

function useBreadcrumbs(): Breadcrumb[] {
  const matches = useMatches()
  const crumbs: Breadcrumb[] = []

  let projectCtx: { projectName: string; projectSlug: string } | null = null
  try {
    const ctx = useCurrentProject()
    projectCtx = { projectName: ctx.projectName, projectSlug: ctx.projectSlug }
  } catch {
    // Not inside a project route — no project context available
  }

  for (const match of matches) {
    const path = match.pathname

    if (path === '/') {
      crumbs.push({ label: 'TheCrew', path: '/' })
    } else if (path.match(/^\/projects\/[^/]+$/)) {
      if (projectCtx) {
        crumbs.push({ label: projectCtx.projectName, path })
      }
    } else if (path.match(/^\/projects\/[^/]+\/.+$/)) {
      const segment = path.split('/').pop()
      if (segment) {
        const label = segment
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')
        crumbs.push({ label, path })
      }
    }
  }

  return crumbs
}
