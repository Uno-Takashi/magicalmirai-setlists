import { LuCheck, LuPlus } from 'react-icons/lu'
import type { SongTitle } from '@/domain/song/Song'
import { useFavorites } from '@/presentation/providers/FavoritesProvider'
import { useLocale } from '@/presentation/providers/LocaleProvider'

/**
 * 曲をお気に入りに出し入れするボタン。
 *
 * 入っていなければ「＋」、入っていれば「✓」。押すたびに入れ替わるので、
 * 状態は絵だけでなく `aria-pressed` と読み上げ名でも伝える。
 */
export function FavoriteButton({ title, className }: { title: SongTitle; className?: string }) {
  const { t } = useLocale()
  const { has, toggle } = useFavorites()
  const added = has(title)

  return (
    <button
      type="button"
      aria-pressed={added}
      aria-label={t(added ? 'a11y.removeFavorite' : 'a11y.addFavorite', { title })}
      onClick={() => toggle(title)}
      className={`grid size-7 shrink-0 place-items-center rounded-lg transition ${
        added ? 'bg-miku/15 text-miku' : 'text-muted hover:bg-black/[0.06]'
      } ${className ?? ''}`}
    >
      {added ? <LuCheck className="text-sm" /> : <LuPlus className="text-sm" />}
    </button>
  )
}
