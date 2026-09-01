import type { VocaloidId } from '@/domain/vocaloid/Vocaloid'
import { localize } from '@/domain/vocaloid/Vocaloid'
import { useCatalog } from '@/presentation/providers/CatalogProvider'
import { useLocale } from '@/presentation/providers/LocaleProvider'

/** 歌唱ボーカロイドをテーマカラーのチップで並べる。 */
export function VocaloidChips({ singers }: { singers: readonly VocaloidId[] }) {
  const { catalog } = useCatalog()
  const { locale } = useLocale()

  if (singers.length === 0) return null

  return (
    <span className="flex flex-wrap items-center gap-1">
      {singers.map((id) => {
        const vocaloid = catalog.vocaloids.get(id)
        if (vocaloid === undefined) return null
        return (
          <span
            key={id}
            className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] leading-none font-medium"
            style={{ backgroundColor: `${vocaloid.color}26`, color: vocaloid.color }}
          >
            <span
              className="size-1.5 rounded-full"
              style={{ backgroundColor: vocaloid.color }}
              aria-hidden
            />
            {localize(vocaloid.name, locale)}
          </span>
        )
      })}
    </span>
  )
}
