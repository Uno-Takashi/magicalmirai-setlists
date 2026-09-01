import type { Performance } from '@/domain/edition/Performance'
import { showsByDate } from '@/domain/edition/Performance'
import { parseEventDate } from '@/domain/edition/Show'
import { SessionBadge } from '@/presentation/components/edition/SessionMark'
import { useDateFormatters } from '@/presentation/hooks/useFormatters'

/**
 * 公演日程。カードでは幅が無いので昼夜をアイコンだけで示しているが、ここは
 * 場所があるのでアイコンに「昼公演 / 夜公演」の文言を添える。昼夜の区別が
 * 無い年は、データにある表示ラベル (Day.1 など) をそのまま出す。
 */
export function PerformanceSchedule({ performance }: { performance: Performance }) {
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
