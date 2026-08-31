import { AnimatePresence, motion } from 'motion/react'
import { LuMapPin, LuX } from 'react-icons/lu'
import type { Performance } from '@/domain/edition/Performance'
import { showsByDate } from '@/domain/edition/Performance'
import { regionColorVar } from '@/domain/edition/Region'
import { parseEventDate } from '@/domain/edition/Show'
import { venueMapEmbedUrl } from '@/domain/edition/venueMapUrl'
import { localize } from '@/domain/vocaloid/Vocaloid'
import { SessionBadge } from '@/presentation/components/SessionMark'
import { useOverlay } from '@/presentation/hooks/useOverlay'
import { useDateFormatters } from '@/presentation/hooks/useFormatters'
import { useLocale } from '@/presentation/providers/LocaleProvider'

/**
 * 公演日程。カードでは幅が無いので昼夜をアイコンだけで示しているが、ここは
 * 場所があるのでアイコンに「昼公演 / 夜公演」の文言を添える。昼夜の区別が
 * 無い年は、データにある表示ラベル (Day.1 など) をそのまま出す。
 */
function Schedule({ performance }: { performance: Performance }) {
  const formatters = useDateFormatters()

  return (
    <ul className="grid gap-1.5">
      {showsByDate(performance).map(({ date, shows }) => {
        const day = parseEventDate(date)
        return (
          <li key={date} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-sm font-semibold tabular-nums">
              {formatters.full.format(day)}
              <span className="text-muted ml-1 font-normal">
                ({formatters.weekday.format(day)})
              </span>
            </span>
            <span className="flex flex-wrap gap-1.5">
              {shows.map((show) =>
                show.session === undefined ? (
                  <span key={show.id} className="rounded-full px-2 py-0.5 text-xs font-semibold">
                    {show.label}
                  </span>
                ) : (
                  <SessionBadge key={show.id} session={show.session} />
                ),
              )}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

/**
 * 会場の場所。地図は開いたときだけ読み込ませたいので、この中で iframe を作る。
 *
 * Google マップへ飛ぶリンクは添えない。埋め込み地図が「大きな地図で見る」を
 * 自前で出すので、同じ行き先のボタンが 2 つ並ぶことになる。
 */
function VenueMap({ performance }: { performance: Performance }) {
  const { t, locale } = useLocale()
  const embedUrl = venueMapEmbedUrl(performance, locale)
  if (embedUrl === undefined || performance.venue === undefined) return null

  return (
    <iframe
      src={embedUrl}
      title={t('a11y.venueMap', { venue: localize(performance.venue, locale) })}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      className="h-56 w-full rounded-xl border-0"
    />
  )
}

/**
 * 会場の詳細。公演地カードの詳細ボタンから開く。
 *
 * カードは 1 行に何枚も並ぶので会場名までしか置けない。会場で使った施設・
 * 地図・日程といった「その会場に行くための情報」はここにまとめる。
 */
export function PerformanceDialog({
  performance,
  onClose,
}: {
  performance: Performance | null
  onClose: () => void
}) {
  const { t, locale } = useLocale()
  useOverlay(performance !== null, onClose)

  return (
    <AnimatePresence>
      {performance !== null ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={localize(performance.city, locale)}
            className="surface-card max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-2xl p-5 shadow-2xl sm:rounded-2xl"
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="flex items-center gap-2 text-lg leading-tight font-bold">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: regionColorVar(performance.region) }}
                  />
                  {localize(performance.city, locale)}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={t('performance.close')}
                className="text-muted shrink-0 rounded-lg p-1.5 transition hover:bg-black/5"
              >
                <LuX />
              </button>
            </div>

            <div className="grid gap-4">
              <section>
                <h3 className="text-muted mb-1.5 text-xs font-semibold">
                  {t('performance.halls')}
                </h3>
                <div className="flex items-start gap-2">
                  <LuMapPin aria-hidden className="text-muted mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold break-words">
                      {performance.venue !== undefined
                        ? localize(performance.venue, locale)
                        : t('edition.venueUnknown')}
                    </p>
                    {/* 公式サイトが会場名しか出していない年は施設名を持たない */}
                    {performance.halls !== undefined ? (
                      <p className="text-muted mt-0.5 text-xs break-words">
                        {localize(performance.halls, locale)}
                      </p>
                    ) : null}
                  </div>
                </div>
              </section>

              <VenueMap performance={performance} />

              <section>
                <h3 className="text-muted mb-1.5 text-xs font-semibold">
                  {t('performance.schedule')}
                </h3>
                <Schedule performance={performance} />
              </section>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
