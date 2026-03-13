import { create } from 'zustand'
import i18n from '@/i18n/config'
import type { SupportedLanguage } from '@/i18n/config'

const STORAGE_KEY = 'the-crew-language'

function getStoredLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') return 'en'
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'en' || stored === 'es') return stored
  } catch {
    // localStorage may not be available in test environments
  }
  return 'en'
}

export interface LanguageStore {
  language: SupportedLanguage
  setLanguage: (lang: SupportedLanguage) => void
}

export const useLanguageStore = create<LanguageStore>((set) => ({
  language: getStoredLanguage(),
  setLanguage: (lang: SupportedLanguage) => {
    try { localStorage.setItem(STORAGE_KEY, lang) } catch { /* private browsing */ }
    i18n.changeLanguage(lang)
    document.documentElement.lang = lang
    set({ language: lang })
  },
}))
