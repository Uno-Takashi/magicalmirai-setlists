import { SESSION_ICON } from '@/presentation/components/edition/sessionVisuals'
import type { VariantLabel } from '@/presentation/components/setlist/trackVariantLabels'
import { CollapsibleChip } from '@/presentation/components/ui/CollapsibleChip'

const CHIP = 'surface-card text-muted rounded px-1.5 py-0.5 text-[10px] whitespace-nowrap'

/** 候補の右に出す札。公演地・日程・昼夜のどれで分かれた候補かを示す。 */
export function TrackVariantLabelChip({ label }: { label: VariantLabel }) {
  const Icon = label.icon
  if (label.text === '' && label.days === undefined) return null

  const body = (
    <>
      {label.text}
      {label.days?.map(({ day, sessions }) => (
        <span key={day} className="ml-1 inline-flex items-center gap-0.5">
          {day}
          {sessions.map((session) => {
            const SessionIcon = SESSION_ICON[session]
            return <SessionIcon key={session} aria-hidden />
          })}
        </span>
      ))}
    </>
  )

  // 目印になるアイコンを持たない札 (日程だけの札や、出典の但し書き) は畳まない。
  // 畳むと何も残らず、その札があること自体が見えなくなってしまう。
  if (Icon === undefined) {
    return <span className={`inline-flex items-center gap-1 ${CHIP}`}>{body}</span>
  }

  return (
    <CollapsibleChip className={CHIP} mark={<Icon className="shrink-0" aria-hidden />}>
      {body}
    </CollapsibleChip>
  )
}
