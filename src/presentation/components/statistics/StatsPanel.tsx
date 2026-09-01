import type { ReactNode } from 'react'
import { LuPlus } from 'react-icons/lu'
import { HelpTip } from '@/presentation/components/ui/HelpTip'
import { useLocale } from '@/presentation/providers/LocaleProvider'

/**
 * 統計のひとかたまり。見出し・中身・「もっと見る」を同じ形で囲う。
 *
 * 見出しを省くと中身だけの箱になる。掘り下げのページのように、ページの見出しで
 * 何の表かがすでに分かっている場合に使う。
 */
export function StatsPanel({
  title,
  help,
  action,
  onShowAll,
  children,
}: {
  title?: string
  /** 指定すると、見出しの横に「?」を出してマウスオーバーで説明する。 */
  help?: string
  /** 見出しの右端に置く操作。推移グラフの表示切り替えなど。 */
  action?: ReactNode
  /** 指定すると、中身の下に「もっと見る」ボタンを出す。 */
  onShowAll?: () => void
  children: ReactNode
}) {
  const { t } = useLocale()

  return (
    <section className="surface-card mt-4 rounded-2xl p-4">
      {title !== undefined ? (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h3 className="flex flex-1 items-center gap-1.5 text-sm font-bold">
            {title}
            {help !== undefined ? <HelpTip text={help} /> : null}
          </h3>
          {action}
        </div>
      ) : null}

      {children}

      {onShowAll !== undefined ? (
        <button
          type="button"
          onClick={onShowAll}
          className="text-muted mt-3 inline-flex w-full items-center justify-center gap-1 rounded-lg py-2 text-xs font-semibold transition hover:bg-black/[0.04]"
        >
          <LuPlus aria-hidden />
          {t('statistics.showMore')}
        </button>
      ) : null}
    </section>
  )
}
