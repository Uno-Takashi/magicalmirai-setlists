import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useId, useState } from 'react'
import { LuChevronDown, LuGlobe } from 'react-icons/lu'
import { editionPeriod, type Edition } from '@/domain/edition/Edition'
import type { Performance } from '@/domain/edition/Performance'
import { PerformanceRail } from '@/presentation/components/edition/PerformanceRail'
import { formatDateRange, useDateFormatters } from '@/presentation/hooks/useFormatters'
import { useLocale } from '@/presentation/providers/LocaleProvider'

/** 開け閉めの動き。高さは中身の分だけ伸び縮みする。 */
const EXPAND = { duration: 0.28, ease: [0.22, 1, 0.36, 1] } as const

/** 中身の出方。高さが開くのにわずかに遅れて浮かび上がらせる。 */
const CONTENT = {
  initial: { opacity: 0, y: -6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.24, delay: 0.06 } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.12 } },
} as const

const NO_MOTION = { duration: 0 } as const

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
  // 開き切ったかどうか。伸びている間だけ高さで切り取り、開き切ったら overflow を
  // 戻す。開いたまま切り取り続けると、公演地カードの hover の影が下端で切れる。
  const [expanded, setExpanded] = useState(false)
  const reduceMotion = useReducedMotion()
  const contentId = useId()

  const period = editionPeriod(edition)
  const periodText = period === null ? '' : formatDateRange(period, formatters)

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={() => {
          setExpanded(false)
          setOpen((current) => !current)
        }}
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

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={contentId}
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={reduceMotion ? NO_MOTION : EXPAND}
            onAnimationComplete={() => setExpanded(true)}
            style={{ overflow: expanded ? 'visible' : 'hidden' }}
          >
            <motion.div
              className="mt-3"
              initial={CONTENT.initial}
              animate={reduceMotion ? { opacity: 1, y: 0, transition: NO_MOTION } : CONTENT.animate}
              exit={reduceMotion ? { opacity: 0, y: 0, transition: NO_MOTION } : CONTENT.exit}
            >
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

              <PerformanceRail
                performances={edition.performances}
                onShowDetail={onShowPerformance}
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
