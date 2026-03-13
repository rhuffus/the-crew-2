import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// EN namespaces
import enCommon from './locales/en/common.json'
import enNavigation from './locales/en/navigation.json'
import enCanvas from './locales/en/canvas.json'
import enExplorer from './locales/en/explorer.json'
import enInspector from './locales/en/inspector.json'
import enShortcuts from './locales/en/shortcuts.json'
import enForms from './locales/en/forms.json'
import enEntities from './locales/en/entities.json'
import enAdmin from './locales/en/admin.json'
import enContextMenu from './locales/en/context-menu.json'
import enChat from './locales/en/chat.json'

// ES namespaces
import esCommon from './locales/es/common.json'
import esNavigation from './locales/es/navigation.json'
import esCanvas from './locales/es/canvas.json'
import esExplorer from './locales/es/explorer.json'
import esInspector from './locales/es/inspector.json'
import esShortcuts from './locales/es/shortcuts.json'
import esForms from './locales/es/forms.json'
import esEntities from './locales/es/entities.json'
import esAdmin from './locales/es/admin.json'
import esContextMenu from './locales/es/context-menu.json'
import esChat from './locales/es/chat.json'

export const defaultNS = 'common'
export const supportedLanguages = ['en', 'es'] as const
export type SupportedLanguage = (typeof supportedLanguages)[number]

const STORAGE_KEY = 'the-crew-language'

function getInitialLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') return 'en'
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'en' || stored === 'es') return stored
  } catch {
    // localStorage may not be available in test environments
  }
  return 'en'
}

i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: enCommon,
      navigation: enNavigation,
      canvas: enCanvas,
      explorer: enExplorer,
      inspector: enInspector,
      shortcuts: enShortcuts,
      forms: enForms,
      entities: enEntities,
      admin: enAdmin,
      'context-menu': enContextMenu,
      chat: enChat,
    },
    es: {
      common: esCommon,
      navigation: esNavigation,
      canvas: esCanvas,
      explorer: esExplorer,
      inspector: esInspector,
      shortcuts: esShortcuts,
      forms: esForms,
      entities: esEntities,
      admin: esAdmin,
      'context-menu': esContextMenu,
      chat: esChat,
    },
  },
  lng: getInitialLanguage(),
  fallbackLng: 'en',
  defaultNS,
  ns: ['common', 'navigation', 'canvas', 'explorer', 'inspector', 'shortcuts', 'forms', 'entities', 'admin', 'context-menu', 'chat'],
  interpolation: {
    escapeValue: false, // React already escapes
  },
})

export default i18n
