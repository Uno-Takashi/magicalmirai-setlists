import type { ReactNode } from 'react'
import { usePreferences } from '@/presentation/providers/PreferencesProvider'

/**
 * 畳めるタグ。
 *
 * 設定で「タグの省略表示」を選ぶと、目印 (色の丸やアイコン) だけになり、
 * マウスを載せるか焦点が当たったときに文言が開く。曲名の並びを見渡しやすくする
 * ためのもので、既定では畳まない。
 *
 * **文言は畳んでいる間も DOM に残す。** 幅を 0 にして隠すだけなので、読み上げでは
 * これまでどおり「テーマソング」「初音ミク」と読める。`display: none` で消すと
 * 目印だけになり、色に頼った表示になってしまう。
 */
export function CollapsibleChip({
  mark,
  className,
  style,
  children,
}: {
  /** 畳んだときに残す目印。色の丸やアイコン。 */
  mark: ReactNode
  className?: string
  style?: React.CSSProperties
  /** 開いたときに出る文言。 */
  children: ReactNode
}) {
  const { compactTags } = usePreferences()

  return (
    <span
      className={`group/chip inline-flex max-w-full items-center overflow-hidden transition-[gap] ${
        compactTags ? 'gap-0 focus-within:gap-1 hover:gap-1' : 'gap-1'
      } ${className ?? ''}`}
      style={style}
    >
      {mark}
      <span
        className={
          compactTags
            ? 'inline-block max-w-0 overflow-hidden whitespace-nowrap transition-[max-width] duration-200 group-hover/chip:max-w-40 group-focus-within/chip:max-w-40'
            : undefined
        }
      >
        {children}
      </span>
    </span>
  )
}
