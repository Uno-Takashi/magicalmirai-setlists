import { createContext } from 'react'
import type { Locale, Translate } from '@/infrastructure/i18n/i18n'
import { useRequiredContext } from './requiredContext'

export interface LocaleContextValue {
  readonly locale: Locale
  readonly setLocale: (locale: Locale) => void
  readonly t: Translate
}

export const LocaleContext = createContext<LocaleContextValue | null>(null)

export function useLocale(): LocaleContextValue {
  return useRequiredContext(LocaleContext, 'useLocale')
}
