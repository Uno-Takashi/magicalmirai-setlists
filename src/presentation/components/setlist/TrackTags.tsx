import type { ComponentType } from 'react'
import { BsFire, BsFlagFill } from 'react-icons/bs'
import { LuCrown, LuDisc3, LuGuitar } from 'react-icons/lu'
import type { TrackTag } from '@/domain/setlist/TrackTag'
import { CollapsibleChip } from '@/presentation/components/ui/CollapsibleChip'
import { useLocale } from '@/presentation/providers/LocaleProvider'

const TAG_STYLE: Record<TrackTag, string> = {
  encore: 'bg-meiko/20 text-meiko',
  'theme-song': 'bg-miku/20 text-miku',
  'grand-prix': 'bg-rin/20 text-rin',
  'band-intro': 'bg-slate-400/20 text-muted',
  'bonus-track': 'bg-slate-400/20 text-muted',
}

/**
 * タグに添えるアイコン。
 *
 * 文言と一緒に出す目印であると同時に、省略表示のときは**これだけが残る**ので、
 * どのタグにも 1 つずつ持たせる。
 */
const TAG_ICON: Record<TrackTag, ComponentType<{ className?: string }>> = {
  encore: BsFire,
  'theme-song': BsFlagFill,
  'grand-prix': LuCrown,
  'band-intro': LuGuitar,
  'bonus-track': LuDisc3,
}

export function TrackTags({ tags }: { tags: readonly TrackTag[] }) {
  const { t } = useLocale()
  if (tags.length === 0) return null

  return (
    <span className="flex flex-wrap gap-1">
      {tags.map((tag) => {
        const Icon = TAG_ICON[tag]
        return (
          <CollapsibleChip
            key={tag}
            className={`rounded px-1.5 py-0.5 text-[10px] leading-none font-semibold ${TAG_STYLE[tag]}`}
            mark={<Icon className="shrink-0" aria-hidden />}
          >
            {t(`tag.${tag}`)}
          </CollapsibleChip>
        )
      })}
    </span>
  )
}
