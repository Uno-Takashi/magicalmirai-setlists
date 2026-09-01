import { LuChevronLeft } from 'react-icons/lu'
import { useLocale } from '@/presentation/providers/LocaleProvider'

/**
 * 掘り下げのページから統計の全体へ戻る導線。
 *
 * ここへはブラウザの戻るでも帰れるが、統計から「もっと見る」で来た人には
 * 画面の中に戻り道が見えている必要がある (直接この URL を開くこともある)。
 */
export function BackToStatistics({ onBack }: { onBack: () => void }) {
  const { t } = useLocale()
  return (
    <button
      type="button"
      onClick={onBack}
      className="text-muted -ml-1.5 inline-flex items-center gap-0.5 rounded-lg px-1.5 py-1 text-xs font-semibold transition hover:bg-black/[0.04]"
    >
      <LuChevronLeft aria-hidden />
      {t('statistics.backToOverview')}
    </button>
  )
}
