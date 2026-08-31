import { LuCalendarDays, LuMapPin, LuMoon, LuSun } from 'react-icons/lu'
import { showsByDate, type Performance } from '@/domain/edition/Performance'
import { regionColorVar } from '@/domain/edition/Region'
import { showDate, type Session } from '@/domain/edition/Show'
import { localize } from '@/domain/vocaloid/Vocaloid'
import { useDateFormatters } from '@/presentation/hooks/useFormatters'
import { useLocale } from '@/presentation/providers/LocaleProvider'

/**
 * 1 年に行われた公演を並べる。各カードがその公演地の日程(昼夜含む)を持つので、
 * 1 画面で「その年に何がどこで何日あったか」が読める。
 *
 * 幅の狭い画面では縦に積む。横並びのままだと 2 枚目以降が画面の外に出てしまい、
 * 年送りの横スワイプと競合して、そこまでスクロールして選ぶことができない。
 */
const SESSION_ICON = { matinee: LuSun, evening: LuMoon } as const
const SESSION_COLOR = {
  matinee: 'var(--color-session-matinee)',
  evening: 'var(--color-session-evening)',
} as const

/** 昼夜をアイコンで示す。アイコンだけでは伝わらないので読み上げ用の文言も置く。 */
function SessionMark({ session }: { session: Session }) {
  const { t } = useLocale()
  const Icon = SESSION_ICON[session]
  return (
    <span className="inline-flex items-center" style={{ color: SESSION_COLOR[session] }}>
      <Icon aria-hidden />
      <span className="sr-only">{t(`session.${session}`)}</span>
    </span>
  )
}

export function PerformanceRail({
  performances,
  selectedId,
  onSelect,
}: {
  performances: readonly Performance[]
  selectedId: string
  onSelect: (id: string) => void
}) {
  const { t, locale } = useLocale()
  const formatters = useDateFormatters()

  return (
    <div className="-mx-4 px-4 pb-1 sm:overflow-x-auto">
      {/* 横並びのときは items-stretch で全カードをその年の最も高いカードに合わせる。
          公演地ごとに日程の数が違うので、揃えないと下端がばらつく */}
      <ul className="flex flex-col gap-2 sm:min-w-max sm:flex-row sm:items-stretch sm:gap-3">
        {performances.map((performance) => {
          const selected = performance.id === selectedId
          const color = regionColorVar(performance.region)
          return (
            <li key={performance.id}>
              <button
                type="button"
                onClick={() => onSelect(performance.id)}
                aria-pressed={selected}
                aria-label={t('a11y.selectPerformance', {
                  city: localize(performance.city, locale),
                })}
                className="surface-card h-full w-full rounded-xl p-3 text-left transition hover:-translate-y-0.5 hover:shadow-lg sm:w-56"
              >
                {/* 狭いときは公演地と会場を同じ行に流し込み、1 枚あたりの高さを抑える */}
                <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 sm:block">
                  <span className="flex items-center gap-1.5 text-sm font-bold">
                    <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
                    {localize(performance.city, locale)}
                  </span>

                  <span className="text-muted flex min-w-0 items-start gap-1.5 text-xs sm:mt-1">
                    <LuMapPin aria-hidden className="mt-0.5 shrink-0" />
                    <span className="min-w-0">
                      {performance.venue !== undefined
                        ? localize(performance.venue, locale)
                        : t('edition.venueUnknown')}
                    </span>
                  </span>
                </span>

                <span className="text-muted mt-1.5 flex items-start gap-1.5 text-xs sm:mt-2">
                  <LuCalendarDays aria-hidden className="mt-0.5 shrink-0" />
                  <span className="flex flex-wrap gap-x-2.5 gap-y-0.5">
                    {showsByDate(performance).map(({ date, shows }) => (
                      <span
                        key={date}
                        className="inline-flex items-center gap-1 whitespace-nowrap tabular-nums"
                      >
                        {formatters.short.format(showDate(shows[0]!))}
                        {shows.map((show) =>
                          show.session === undefined ? null : (
                            <SessionMark key={show.id} session={show.session} />
                          ),
                        )}
                      </span>
                    ))}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
