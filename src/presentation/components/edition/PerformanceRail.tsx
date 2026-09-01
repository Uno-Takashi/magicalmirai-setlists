import { LuCalendarDays, LuInfo, LuMapPin } from 'react-icons/lu'
import { showsByDate, type Performance } from '@/domain/edition/Performance'
import { regionColorVar } from '@/domain/edition/Region'
import { showDate } from '@/domain/edition/Show'
import { localize } from '@/domain/vocaloid/Vocaloid'
import { SessionMark } from '@/presentation/components/edition/SessionMark'
import { useDateFormatters } from '@/presentation/hooks/useFormatters'
import { useLocale } from '@/presentation/providers/LocaleProvider'

/**
 * 1 年に行われた公演を並べる。各カードがその公演地の日程(昼夜含む)を持つので、
 * 1 画面で「その年に何がどこで何日あったか」が読める。
 *
 * カードは会場のインフォメーションで、押すと会場情報のモーダルが開く。
 * セットリストの切り替えはここではなく `SetlistSwitch` が持つ。
 *
 * 幅の狭い画面では縦に積む。横並びのままだと 2 枚目以降が画面の外に出てしまい、
 * 年送りの横スワイプと競合して、そこまでスクロールできない。
 */
export function PerformanceRail({
  performances,
  onShowDetail,
}: {
  performances: readonly Performance[]
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
          const color = regionColorVar(performance.region)
          return (
            <li key={performance.id} className="h-full">
              {/* カード全体が会場情報を開くボタン。右肩のアイコンはその目印なので、
                  本体の文字を pr-10 で避けておく。文言はカードに見えているので
                  aria-label は付けない (読み上げ名と見た目が食い違うため) */}
              <button
                type="button"
                onClick={() => onShowDetail(performance)}
                className="surface-card relative h-full w-full rounded-xl p-3 pr-10 text-left transition hover:-translate-y-0.5 hover:shadow-lg sm:w-56"
              >
                <LuInfo aria-hidden className="text-muted absolute top-3 right-3" />
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
