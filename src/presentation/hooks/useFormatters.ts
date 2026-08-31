import { useMemo } from 'react'
import { useLocale } from '@/presentation/providers/LocaleProvider'

/** ロケールに合わせた日付フォーマッタ。Intl のインスタンス生成は毎描画では行わない。 */
export function useDateFormatters() {
  const { locale } = useLocale()
  return useMemo(
    () => ({
      full: new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' }),
      short: new Intl.DateTimeFormat(locale, { month: 'numeric', day: 'numeric' }),
      weekday: new Intl.DateTimeFormat(locale, { weekday: 'short' }),
    }),
    [locale],
  )
}
