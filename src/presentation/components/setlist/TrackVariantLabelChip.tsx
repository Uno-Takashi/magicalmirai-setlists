import { SESSION_ICON } from '@/presentation/components/edition/sessionVisuals'
import type { VariantLabel } from '@/presentation/components/setlist/trackVariantLabels'

/** 候補の右に出す札。公演地・日程・昼夜のどれで分かれた候補かを示す。 */
export function TrackVariantLabelChip({ label }: { label: VariantLabel }) {
  const Icon = label.icon
  if (label.text === '' && label.days === undefined) return null

  return (
    <span className="surface-card text-muted inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] whitespace-nowrap">
      {Icon !== undefined ? <Icon aria-hidden /> : null}
      {label.text}
      {label.days?.map(({ day, sessions }) => (
        <span key={day} className="inline-flex items-center gap-0.5">
          {day}
          {sessions.map((session) => {
            const SessionIcon = SESSION_ICON[session]
            return <SessionIcon key={session} aria-hidden />
          })}
        </span>
      ))}
    </span>
  )
}
