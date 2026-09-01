import { LuMoon, LuSun } from 'react-icons/lu'

/**
 * 昼夜の見た目。太陽と三日月、そしてその色。
 *
 * 公演地カードの印 (`SessionMark`)・会場情報の札 (`SessionBadge`)・セットリストの
 * 候補の札 (`TrackVariantLabelChip`) で同じ絵を使う。どこで見ても同じ印が
 * 同じ意味になるよう、定義はここ 1 か所に置く。
 */
export const SESSION_ICON = { matinee: LuSun, evening: LuMoon } as const

export const SESSION_COLOR = {
  matinee: 'var(--color-session-matinee)',
  evening: 'var(--color-session-evening)',
} as const
