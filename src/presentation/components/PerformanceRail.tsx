import { LuCalendarDays, LuInfo, LuMapPin } from 'react-icons/lu'
import { showsByDate, type Performance } from '@/domain/edition/Performance'
import { regionColorVar } from '@/domain/edition/Region'
import { showDate } from '@/domain/edition/Show'
import { localize } from '@/domain/vocaloid/Vocaloid'
import { SessionMark } from '@/presentation/components/SessionMark'
import { useDateFormatters } from '@/presentation/hooks/useFormatters'
import { useLocale } from '@/presentation/providers/LocaleProvider'

/**
 * 1 年に行われた公演を並べる。各カードがその公演地の日程(昼夜含む)を持つので、
 * 1 画面で「その年に何がどこで何日あったか」が読める。
 *
 * 幅の狭い画面では縦に積む。横並びのままだと 2 枚目以降が画面の外に出てしまい、
 * 年送りの横スワイプと競合して、そこまでスクロールして選ぶことができない。
 */
export function PerformanceRail({
  performances,
  selectedId,
  onSelect,
  onShowDetail,
}: {
  performances: readonly Performance[]
  selectedId: string
  onSelect: (id: string) => void
  /** 会場情報のモーダルを開く。 */
  onShowDetail: (performance: Performance) => void
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
            <li key={performance.id} className="relative h-full">
              {/* 右肩は詳細ボタンの場所なので、本体の文字を pr-10 で避けておく。
                  選択中は公演地の色で縁取る。どの公演のセットリストを見ているかは
                  ここでしか分からないので、色は必ず出す */}
              <button
                type="button"
                onClick={() => onSelect(performance.id)}
                aria-pressed={selected}
                aria-label={t('a11y.selectPerformance', {
                  city: localize(performance.city, locale),
                })}
                className={`surface-card h-full w-full rounded-xl p-3 pr-10 text-left transition hover:-translate-y-0.5 hover:shadow-lg sm:w-56 ${
                  selected ? '-translate-y-0.5 shadow-md' : ''
                }`}
                style={
                  selected ? { outline: `2px solid ${color}`, outlineOffset: '2px' } : undefined
                }
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

              {/* カード本体は button なので入れ子にできない。兄弟として重ねる */}
              <button
                type="button"
                onClick={() => onShowDetail(performance)}
                aria-label={t('a11y.performanceDetail', {
                  city: localize(performance.city, locale),
                })}
                className="text-muted absolute top-2 right-2 rounded-lg p-1.5 transition hover:bg-black/5 hover:text-current"
              >
                <LuInfo aria-hidden />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
