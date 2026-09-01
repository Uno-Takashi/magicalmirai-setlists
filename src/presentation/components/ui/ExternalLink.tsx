import type { ReactNode } from 'react'
import { LuExternalLink } from 'react-icons/lu'

/**
 * 外部サイトへの行き先を 1 行のカードで出す。
 *
 * 押せる面を広く取り、右端の矢印で「サイトの外へ出る」ことを示す。
 * 文言はカードに見えているので `aria-label` は付けない。
 */
export function ExternalLink({
  href,
  /** 行頭に置くサービスや出典のアイコン。 */
  icon,
  children,
}: {
  href: string
  icon?: ReactNode
  children: ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="surface-card flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      {icon}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      <LuExternalLink aria-hidden className="text-muted shrink-0 text-xs" />
    </a>
  )
}
