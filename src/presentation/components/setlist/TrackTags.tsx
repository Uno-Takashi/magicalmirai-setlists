import type { ComponentType } from 'react'
import { BsFire, BsFlagFill } from 'react-icons/bs'
import { LuCrown } from 'react-icons/lu'
import type { TrackTag } from '@/domain/setlist/TrackTag'
import { useLocale } from '@/presentation/providers/LocaleProvider'

const TAG_STYLE: Record<TrackTag, string> = {
  encore: 'bg-meiko/20 text-meiko',
  'theme-song': 'bg-miku/20 text-miku',
  'grand-prix': 'bg-rin/20 text-rin',
  'band-intro': 'bg-slate-400/20 text-muted',
  'bonus-track': 'bg-slate-400/20 text-muted',
}

/** アイコンを添えるタグ。指定の無いタグは文字だけで出す。 */
const TAG_ICON: Partial<Record<TrackTag, ComponentType>> = {
  encore: BsFire,
  'theme-song': BsFlagFill,
  'grand-prix': LuCrown,
}

export function TrackTags({ tags }: { tags: readonly TrackTag[] }) {
  const { t } = useLocale()
  if (tags.length === 0) return null

  return (
    <span className="flex flex-wrap gap-1">
      {tags.map((tag) => {
        const Icon = TAG_ICON[tag]
        return (
          <span
            key={tag}
            className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] leading-none font-semibold ${TAG_STYLE[tag]}`}
          >
            {Icon !== undefined ? <Icon aria-hidden /> : null}
            {t(`tag.${tag}`)}
          </span>
        )
      })}
    </span>
  )
}
