import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { createTranslate, type Locale, type Translate } from '@/infrastructure/i18n/i18n'
import { preferredLocale, writeStoredLocale } from '@/infrastructure/i18n/localePreference'

interface LocaleContextValue {
  readonly locale: Locale
  readonly setLocale: (locale: Locale) => void
  readonly t: Translate
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(preferredLocale)

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    writeStoredLocale(next)
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, t: createTranslate(locale) }),
    [locale, setLocale],
  )

  return <LocaleContext value={value}>{children}</LocaleContext>
}

export function useLocale(): LocaleContextValue {
  const value = use(LocaleContext)
  if (value === null) throw new Error('LocaleProvider の外で useLocale を呼び出しています')
  return value
}
