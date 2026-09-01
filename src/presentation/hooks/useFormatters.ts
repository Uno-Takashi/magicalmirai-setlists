import { useMemo } from 'react'
import { parseEventDate } from '@/domain/edition/Show'
import { useLocale } from '@/presentation/providers/LocaleProvider'

export type DateFormatters = ReturnType<typeof useDateFormatters>

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

/**
 * 期間の表示。同じ日で始まって終わるものは 1 日として出す。
 * (2013 年のように 1 日だけの開催があるため)
 */
export function formatDateRange(
  period: { from: string; to: string },
  formatters: DateFormatters,
): string {
  const from = formatters.full.format(parseEventDate(period.from))
  if (period.from === period.to) return from
  return `${from} – ${formatters.full.format(parseEventDate(period.to))}`
}
