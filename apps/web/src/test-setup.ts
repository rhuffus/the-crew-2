import '@testing-library/jest-dom/vitest'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Initialize i18n for tests with EN translations bundled statically
import enCommon from './i18n/locales/en/common.json'
import enNavigation from './i18n/locales/en/navigation.json'
import enCanvas from './i18n/locales/en/canvas.json'
import enExplorer from './i18n/locales/en/explorer.json'
import enInspector from './i18n/locales/en/inspector.json'
import enShortcuts from './i18n/locales/en/shortcuts.json'
import enForms from './i18n/locales/en/forms.json'
import enEntities from './i18n/locales/en/entities.json'
import enAdmin from './i18n/locales/en/admin.json'
import enContextMenu from './i18n/locales/en/context-menu.json'
import enChat from './i18n/locales/en/chat.json'
import esCommon from './i18n/locales/es/common.json'
import esNavigation from './i18n/locales/es/navigation.json'
import esCanvas from './i18n/locales/es/canvas.json'
import esExplorer from './i18n/locales/es/explorer.json'
import esInspector from './i18n/locales/es/inspector.json'
import esShortcuts from './i18n/locales/es/shortcuts.json'
import esForms from './i18n/locales/es/forms.json'
import esEntities from './i18n/locales/es/entities.json'
import esAdmin from './i18n/locales/es/admin.json'
import esContextMenu from './i18n/locales/es/context-menu.json'
import esChat from './i18n/locales/es/chat.json'

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
  lng: 'en',
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common', 'navigation', 'canvas', 'explorer', 'inspector', 'shortcuts', 'forms', 'entities', 'admin', 'context-menu', 'chat'],
  interpolation: { escapeValue: false },
})

// React Flow requires ResizeObserver in tests
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver
}

// React Flow reads from getBoundingClientRect
if (typeof Element.prototype.getBoundingClientRect === 'undefined') {
  Element.prototype.getBoundingClientRect = () => ({
    x: 0, y: 0, width: 0, height: 0, top: 0, right: 0, bottom: 0, left: 0, toJSON: () => '',
  })
}
