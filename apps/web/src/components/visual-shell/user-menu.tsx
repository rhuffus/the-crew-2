import { useState, useRef, useEffect } from 'react'
import { User, Globe, Check, Sun, Moon, Monitor, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import { useLanguageStore } from '@/stores/language-store'
import { type Theme, useThemeStore } from '@/stores/theme-store'
import type { SupportedLanguage } from '@/i18n/config'

const LANGUAGE_OPTIONS: { code: SupportedLanguage; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
]

const THEME_OPTIONS: { value: Theme; labelKey: string; icon: typeof Sun }[] = [
  { value: 'light', labelKey: 'themeLight', icon: Sun },
  { value: 'dark', labelKey: 'themeDark', icon: Moon },
  { value: 'system', labelKey: 'themeSystem', icon: Monitor },
]

export function UserMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const { language, setLanguage } = useLanguageStore()
  const { theme, setTheme } = useThemeStore()

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as HTMLElement)) {
        setOpen(false)
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  return (
    <div ref={ref} className="relative" data-testid="user-menu">
      <button
        type="button"
        data-testid="user-menu-trigger"
        onClick={() => setOpen(!open)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        aria-label="User menu"
      >
        <User className="h-4 w-4" />
      </button>

      {open && (
        <div
          data-testid="user-menu-dropdown"
          className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-border bg-popover p-1 shadow-lg"
        >
          <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-muted-foreground">
            <Globe className="h-3.5 w-3.5" />
            {t('language')}
          </div>
          {LANGUAGE_OPTIONS.map((opt) => (
            <button
              key={opt.code}
              type="button"
              data-testid={`language-option-${opt.code}`}
              onClick={() => {
                setLanguage(opt.code)
                setOpen(false)
              }}
              className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm ${
                language === opt.code
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-foreground hover:bg-accent'
              }`}
            >
              {opt.label}
              {language === opt.code && <Check className="h-4 w-4" />}
            </button>
          ))}

          <div className="mx-1 my-1 h-px bg-border" />

          <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-muted-foreground">
            <Sun className="h-3.5 w-3.5" />
            {t('theme')}
          </div>
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              data-testid={`theme-option-${opt.value}`}
              onClick={() => {
                setTheme(opt.value)
                setOpen(false)
              }}
              className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm ${
                theme === opt.value
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-foreground hover:bg-accent'
              }`}
            >
              <span className="flex items-center gap-2">
                <opt.icon className="h-4 w-4" />
                {t(opt.labelKey)}
              </span>
              {theme === opt.value && <Check className="h-4 w-4" />}
            </button>
          ))}

          <div className="mx-1 my-1 h-px bg-border" />

          <button
            type="button"
            data-testid="settings-link"
            onClick={() => {
              navigate({ to: '/settings' })
              setOpen(false)
            }}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-accent"
          >
            <Settings className="h-4 w-4" />
            {t('settings')}
          </button>
        </div>
      )}
    </div>
  )
}
