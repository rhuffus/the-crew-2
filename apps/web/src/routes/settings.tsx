import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Key, Eye, EyeOff, Check, Globe, Sun, Moon, Monitor, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { ShellLayout } from '@/components/shell/shell-layout'
import {
  useAiProviderConfigs,
  useUpsertAiProviderConfig,
  useDeleteAiProviderConfig,
} from '@/hooks/use-ai-provider-config'
import { useLanguageStore } from '@/stores/language-store'
import { type Theme, useThemeStore } from '@/stores/theme-store'
import type { SupportedLanguage } from '@/i18n/config'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

import type { AiAuthType } from '@the-crew/shared-types'

const AI_PROVIDERS = [
  { id: 'claude-max', name: 'Claude Max', placeholder: 'token from setup-token', enabled: true, authType: 'oauth-token' as AiAuthType },
] as const

const LANGUAGE_OPTIONS: { code: SupportedLanguage; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
]

const THEME_OPTIONS: { value: Theme; labelKey: string; icon: typeof Sun }[] = [
  { value: 'light', labelKey: 'themeLight', icon: Sun },
  { value: 'dark', labelKey: 'themeDark', icon: Moon },
  { value: 'system', labelKey: 'themeSystem', icon: Monitor },
]

export function SettingsPage() {
  const { t } = useTranslation('settings')
  const { t: tCommon } = useTranslation('common')
  const { data: configs } = useAiProviderConfigs()
  const { language, setLanguage } = useLanguageStore()
  const { theme, setTheme } = useThemeStore()

  return (
    <ShellLayout>
      <div className="mx-auto max-w-2xl space-y-8" data-testid="settings-page">
        <h1 className="text-2xl font-semibold text-foreground">{t('title')}</h1>

        {/* AI Providers Section */}
        <section>
          <h2 className="text-lg font-medium text-foreground">{t('aiProviders.title')}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t('aiProviders.description')}</p>
          <div className="mt-4 space-y-4">
            {AI_PROVIDERS.map((provider) => {
              const existing = configs?.find((c) => c.providerId === provider.id)
              return (
                <AiProviderCard
                  key={provider.id}
                  providerId={provider.id}
                  providerName={provider.name}
                  placeholder={provider.placeholder}
                  isSupported={provider.enabled}
                  authType={provider.authType}
                  existingConfig={existing}
                />
              )
            })}
          </div>
        </section>

        {/* Preferences Section */}
        <section>
          <h2 className="text-lg font-medium text-foreground">{t('preferences.title')}</h2>
          <div className="mt-4 space-y-4">
            {/* Language */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Globe className="h-4 w-4" />
                {t('preferences.language')}
              </label>
              <div className="mt-2 flex gap-2">
                {LANGUAGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.code}
                    type="button"
                    data-testid={`settings-language-${opt.code}`}
                    onClick={() => setLanguage(opt.code)}
                    className={`rounded-md border px-3 py-1.5 text-sm ${
                      language === opt.code
                        ? 'border-primary bg-primary/10 text-primary font-medium'
                        : 'border-border text-foreground hover:bg-accent'
                    }`}
                  >
                    {opt.label}
                    {language === opt.code && <Check className="ml-1.5 inline h-3 w-3" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Sun className="h-4 w-4" />
                {t('preferences.theme')}
              </label>
              <div className="mt-2 flex gap-2">
                {THEME_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    data-testid={`settings-theme-${opt.value}`}
                    onClick={() => setTheme(opt.value)}
                    className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm ${
                      theme === opt.value
                        ? 'border-primary bg-primary/10 text-primary font-medium'
                        : 'border-border text-foreground hover:bg-accent'
                    }`}
                  >
                    <opt.icon className="h-3.5 w-3.5" />
                    {tCommon(opt.labelKey)}
                    {theme === opt.value && <Check className="ml-1 h-3 w-3" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </ShellLayout>
  )
}

function AiProviderCard({
  providerId,
  providerName,
  placeholder,
  isSupported,
  authType,
  existingConfig,
}: {
  providerId: string
  providerName: string
  placeholder: string
  isSupported: boolean
  authType: AiAuthType
  existingConfig?: { apiKeyMasked: string; enabled: boolean }
}) {
  const { t } = useTranslation('settings')
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const upsertMutation = useUpsertAiProviderConfig()
  const deleteMutation = useDeleteAiProviderConfig()

  const isConfigured = !!existingConfig

  const handleSave = () => {
    if (!apiKey.trim()) return
    setSaveSuccess(false)
    upsertMutation.mutate(
      { providerId, dto: { name: providerName, apiKey, authType, enabled: true } },
      {
        onSuccess: () => {
          setApiKey('')
          setSaveSuccess(true)
          setTimeout(() => setSaveSuccess(false), 3000)
        },
      },
    )
  }

  const handleClear = () => {
    setSaveSuccess(false)
    deleteMutation.mutate(providerId)
    setApiKey('')
  }

  return (
    <div
      className="rounded-lg border border-border p-4"
      data-testid={`provider-card-${providerId}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-foreground">{providerName}</span>
        </div>
        <div className="flex items-center gap-2">
          {!isSupported && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground" data-testid="coming-soon-badge">
              {t('provider.comingSoon')}
            </span>
          )}
          {isSupported && (
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                isConfigured
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
              }`}
              data-testid={`provider-status-${providerId}`}
            >
              {isConfigured ? t('provider.configured') : t('provider.notConfigured')}
            </span>
          )}
        </div>
      </div>

      {isSupported && (
        <div className="mt-3">
          {isConfigured && (
            <p className="mb-2 text-xs text-muted-foreground">
              Current: {existingConfig.apiKeyMasked}
            </p>
          )}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={placeholder}
                className="h-9 w-full rounded-md border border-input bg-background px-3 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                data-testid={`api-key-input-${providerId}`}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showKey ? t('provider.hide') : t('provider.show')}
                data-testid={`toggle-key-visibility-${providerId}`}
              >
                {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={!apiKey.trim() || upsertMutation.isPending}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              data-testid={`save-key-${providerId}`}
            >
              {upsertMutation.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
              {upsertMutation.isPending ? t('provider.saving') : t('provider.save')}
            </button>
            {isConfigured && (
              <button
                type="button"
                onClick={handleClear}
                disabled={deleteMutation.isPending}
                className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm text-foreground hover:bg-accent disabled:opacity-50"
                data-testid={`clear-key-${providerId}`}
              >
                {t('provider.clear')}
              </button>
            )}
          </div>
          {/* Provider hint */}
          {authType === 'oauth-token' && (
            <p className="mt-2 text-xs text-muted-foreground" data-testid={`provider-hint-${providerId}`}>
              {t('provider.oauthHint')}
            </p>
          )}
          {/* Feedback messages */}
          {upsertMutation.isError && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400" data-testid={`save-error-${providerId}`}>
              <AlertCircle className="h-3 w-3 shrink-0" />
              {t('provider.saveError')}
            </p>
          )}
          {saveSuccess && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400" data-testid={`save-success-${providerId}`}>
              <CheckCircle2 className="h-3 w-3 shrink-0" />
              {t('provider.saved')}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
