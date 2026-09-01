import { useLocale } from '@/presentation/providers/LocaleProvider'

/**
 * 開催回を西暦の小さな札で示すボタン。押すとその年のセットリストへ移る。
 *
 * 中身は数字だけなので、何の年なのかが伝わるよう読み上げ用の名前を添える。
 */
export function EditionYearBadge({ year, onSelect }: { year: number; onSelect: () => void }) {
  const { t } = useLocale()

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={t('a11y.viewEdition', { year })}
      className="bg-miku/15 text-miku hover:bg-miku/25 rounded px-1.5 py-0.5 text-[11px] font-semibold tabular-nums transition"
    >
      {year}
    </button>
  )
}
