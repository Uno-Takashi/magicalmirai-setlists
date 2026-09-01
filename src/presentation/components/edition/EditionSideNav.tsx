import { LuChevronLeft, LuChevronRight } from 'react-icons/lu'
import { useLocale } from '@/presentation/providers/LocaleProvider'

/**
 * 画面の左右端に固定した年送りボタン。
 *
 * 本文は max-w-3xl (768px) に収まるので、その外側にボタンを置ける幅があるときだけ出す。
 * 幅が足りない端末ではスワイプと上部のタブで切り替える。
 * 並びは新しい年が先なので、左が新しい年・右が古い年になる。
 */
export function EditionSideNav({
  canGoNewer,
  canGoOlder,
  onNewer,
  onOlder,
}: {
  canGoNewer: boolean
  canGoOlder: boolean
  onNewer: () => void
  onOlder: () => void
}) {
  const { t } = useLocale()

  const base =
    'surface-card fixed top-1/2 z-20 hidden size-12 -translate-y-1/2 place-items-center rounded-full shadow-lg transition lg:grid enabled:hover:scale-110 enabled:hover:shadow-xl disabled:opacity-25'

  return (
    <>
      <button
        type="button"
        onClick={onNewer}
        disabled={!canGoNewer}
        aria-label={t('nav.newerEdition')}
        className={`${base} left-4 xl:left-8`}
      >
        <LuChevronLeft className="text-xl" />
      </button>

      <button
        type="button"
        onClick={onOlder}
        disabled={!canGoOlder}
        aria-label={t('nav.olderEdition')}
        className={`${base} right-4 xl:right-8`}
      >
        <LuChevronRight className="text-xl" />
      </button>
    </>
  )
}
