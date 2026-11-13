import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { createTranslate, type Locale } from '@/infrastructure/i18n/i18n'
import { preferredLocale, writeStoredLocale } from '@/infrastructure/i18n/localePreference'
import { LocaleContext, type LocaleContextValue } from './LocaleContext'

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(preferredLocale)

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    writeStoredLocale(next)
  }, [])

  // 読み上げソフトの発音と検索エンジンの言語判定は <html lang> を見る。
  // HTML に書いた lang は既定値 (ja) なので、言語を切り替えたら追従させる。
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, t: createTranslate(locale) }),
    [locale, setLocale],
  )

  return <LocaleContext value={value}>{children}</LocaleContext>
}
