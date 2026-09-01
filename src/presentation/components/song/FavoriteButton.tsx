import { LuCheck, LuPlus, LuX } from 'react-icons/lu'
import type { SongTitle } from '@/domain/song/Song'
import { useFavorites } from '@/presentation/providers/FavoritesProvider'
import { useLocale } from '@/presentation/providers/LocaleProvider'

const BUTTON = 'grid size-7 shrink-0 place-items-center rounded-lg transition'

/**
 * 曲をお気に入りに出し入れするボタン。
 *
 * セットリストや検索結果では**出し入れの切り替え**として使う。入っていなければ
 * 「＋」、入っていれば「✓」。押すたびに入れ替わるので、状態は絵だけでなく
 * `aria-pressed` と読み上げ名でも伝える。
 *
 * お気に入りの一覧では `appearance="remove"` にする。そこに並んでいる時点で
 * 入っているのは明らかなので、状態を示すより「×＝ここから消す」と読めるほうが早い。
 */
export function FavoriteButton({
  title,
  appearance = 'toggle',
  className,
}: {
  title: SongTitle
  appearance?: 'toggle' | 'remove'
  className?: string
}) {
  const { t } = useLocale()
  const { has, toggle } = useFavorites()
  const added = has(title)

  if (appearance === 'remove') {
    return (
      <button
        type="button"
        onClick={() => toggle(title)}
        aria-label={t('a11y.removeFavorite', { title })}
        className={`${BUTTON} text-muted hover:bg-meiko/10 hover:text-meiko ${className ?? ''}`}
      >
        <LuX className="text-sm" />
      </button>
    )
  }

  return (
    <button
      type="button"
      aria-pressed={added}
      aria-label={t(added ? 'a11y.removeFavorite' : 'a11y.addFavorite', { title })}
      onClick={() => toggle(title)}
      className={`${BUTTON} ${
        added ? 'bg-miku/15 text-miku' : 'text-muted hover:bg-black/[0.06]'
      } ${className ?? ''}`}
    >
      {added ? <LuCheck className="text-sm" /> : <LuPlus className="text-sm" />}
    </button>
  )
}
