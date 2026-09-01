import { useId, useState } from 'react'
import { LuChevronDown, LuGlobe } from 'react-icons/lu'
import { editionPeriod, type Edition } from '@/domain/edition/Edition'
import type { Performance } from '@/domain/edition/Performance'
import { parseEventDate } from '@/domain/edition/Show'
import { PerformanceRail } from '@/presentation/components/PerformanceRail'
import { useDateFormatters } from '@/presentation/hooks/useFormatters'
import { useLocale } from '@/presentation/providers/LocaleProvider'

/**
 * 公式サイト・日程・会場をまとめた公演情報。
 *
 * 見に来た人の目当てはセットリストなので、既定では畳んで概要だけを出す。
 * 開くと公式サイトへの導線と、公演地ごとのカードが出る。
 */
export function EditionInfoPanel({
  edition,
  onShowPerformance,
}: {
  edition: Edition
  /** 会場情報のモーダルを開く。 */
  onShowPerformance: (performance: Performance) => void
}) {
  const { t } = useLocale()
  const formatters = useDateFormatters()
  const [open, setOpen] = useState(false)
  const contentId = useId()

  const period = editionPeriod(edition)
  const periodText =
    period === null
      ? ''
      : formatters.full.format(parseEventDate(period.from)) +
        (period.from === period.to ? '' : ` – ${formatters.full.format(parseEventDate(period.to))}`)

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls={contentId}
        className="surface-card flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition hover:shadow-sm"
      >
        <LuChevronDown
          aria-hidden
          className={`shrink-0 transition-transform ${open ? '' : '-rotate-90'}`}
        />
        <span className="text-xs font-semibold">{t('edition.info')}</span>
        {/* 畳んでいる間の要約。日程と公演数だけ出して、詳細は開いてから見せる */}
        <span className="text-muted ml-auto flex min-w-0 flex-wrap items-center justify-end gap-x-2 text-[11px] tabular-nums">
          {periodText !== '' ? <span className="truncate">{periodText}</span> : null}
          <span className="whitespace-nowrap">
            {t('edition.performanceCount', { count: edition.performances.length })}
          </span>
        </span>
      </button>

      <div id={contentId} hidden={!open} className="mt-3">
        {edition.officialUrl !== undefined ? (
          <a
            href={edition.officialUrl}
            target="_blank"
            rel="noreferrer"
            className="surface-card mb-3 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <LuGlobe aria-hidden />
            {t('edition.officialSite')}
          </a>
        ) : null}

        <PerformanceRail performances={edition.performances} onShowDetail={onShowPerformance} />
      </div>
    </div>
  )
}
