import { LuMoon, LuSun } from 'react-icons/lu'
import type { Session } from '@/domain/edition/Show'
import { useLocale } from '@/presentation/providers/LocaleProvider'

const SESSION_ICON = { matinee: LuSun, evening: LuMoon } as const
const SESSION_COLOR = {
  matinee: 'var(--color-session-matinee)',
  evening: 'var(--color-session-evening)',
} as const

/**
 * 昼夜をアイコンだけで示す。日付の後ろに並べる公演地カード向けで、
 * 文言を置く幅が無い。アイコンだけでは伝わらないので読み上げ用の文言を添える。
 */
export function SessionMark({ session }: { session: Session }) {
  const { t } = useLocale()
  const Icon = SESSION_ICON[session]
  return (
    <span className="inline-flex items-center" style={{ color: SESSION_COLOR[session] }}>
      <Icon aria-hidden />
      <span className="sr-only">{t(`session.${session}`)}</span>
    </span>
  )
}

/**
 * 昼夜をアイコンと文言で示す札。幅に余裕のある会場情報のモーダル向け。
 * 文言が見えているので、アイコンは読み上げから外す。
 */
export function SessionBadge({ session }: { session: Session }) {
  const { t } = useLocale()
  const Icon = SESSION_ICON[session]
  const color = SESSION_COLOR[session]
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
      style={{ color, backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)` }}
    >
      <Icon aria-hidden />
      {t(`session.${session}`)}
    </span>
  )
}
