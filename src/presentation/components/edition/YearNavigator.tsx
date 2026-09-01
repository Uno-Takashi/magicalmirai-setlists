import { useEffect, useRef } from 'react'
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu'
import type { CSSProperties } from 'react'
import type { EditionEntry } from '@/domain/catalog/Catalog'
import { useScrollEdges } from '@/presentation/hooks/useScrollEdges'
import { useLocale } from '@/presentation/providers/LocaleProvider'

/**
 * 年の切り替え。矢印ボタンと、全年度を並べた横スクロールのタブ。
 * entries は新しい年が先の並びで渡ってくるので、左が新しい年・右が古い年になる。
 */
export function YearNavigator({
  entries,
  currentSlug,
  onSelect,
  onNewer,
  onOlder,
}: {
  entries: readonly EditionEntry[]
  currentSlug: string
  onSelect: (slug: string) => void
  onNewer: () => void
  onOlder: () => void
}) {
  const { t } = useLocale()
  const listRef = useRef<HTMLUListElement>(null)
  const index = entries.findIndex((entry) => entry.edition.slug === currentSlug)

  // まだ表示できていない年がどちら側にあるか。端のフェード幅に使う。
  const [overflow, measure] = useScrollEdges(listRef, entries)

  // 選択中の年が常に見えるようにスクロールを追従させる
  useEffect(() => {
    const active = listRef.current?.querySelector('[data-active="true"]')
    active?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [currentSlug])

  return (
    <nav
      className="surface-card sticky top-0 z-30 backdrop-blur-md"
      aria-label={t('nav.jumpToEdition')}
    >
      <div className="mx-auto flex w-full max-w-3xl items-center gap-1 px-2 py-2">
        <button
          type="button"
          onClick={onNewer}
          disabled={index <= 0}
          aria-label={t('nav.newerEdition')}
          className="shrink-0 rounded-lg p-2 transition enabled:hover:bg-black/5 disabled:opacity-30"
        >
          <LuChevronLeft />
        </button>

        <ul
          ref={listRef}
          onScroll={measure}
          style={
            {
              '--fade-start': overflow.start ? '1.5rem' : '0px',
              '--fade-end': overflow.end ? '1.5rem' : '0px',
            } as CSSProperties
          }
          className="scrollbar-none fade-edges-x flex flex-1 gap-1 overflow-x-auto scroll-smooth px-1"
        >
          {entries.map((entry) => {
            const active = entry.edition.slug === currentSlug
            return (
              <li key={entry.edition.slug}>
                <button
                  type="button"
                  data-active={active}
                  onClick={() => onSelect(entry.edition.slug)}
                  aria-current={active ? 'true' : undefined}
                  aria-label={t('a11y.viewEdition', { year: entry.edition.year })}
                  className={`rounded-lg px-2.5 py-1.5 text-sm font-semibold tabular-nums whitespace-nowrap transition ${
                    active ? 'bg-miku/20 text-miku' : 'text-muted hover:bg-black/5'
                  }`}
                >
                  {entry.edition.year}
                </button>
              </li>
            )
          })}
        </ul>

        <button
          type="button"
          onClick={onOlder}
          disabled={index < 0 || index >= entries.length - 1}
          aria-label={t('nav.olderEdition')}
          className="shrink-0 rounded-lg p-2 transition enabled:hover:bg-black/5 disabled:opacity-30"
        >
          <LuChevronRight />
        </button>
      </div>
    </nav>
  )
}
