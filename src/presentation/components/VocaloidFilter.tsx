import { localize, type VocaloidId } from '@/domain/vocaloid/Vocaloid'
import { useCatalog } from '@/presentation/providers/CatalogProvider'
import { useLocale } from '@/presentation/providers/LocaleProvider'

/**
 * ボーカロイドでの絞り込み。既定は全員 on (= 絞り込みなし)。
 *
 * 選択中はそのボーカロイドのテーマカラー、未選択は淡いグレーで示す。
 * 色だけに頼らないよう、名前は常に表示し `aria-pressed` で状態も伝える。
 */
export function VocaloidFilter({
  selected,
  onToggle,
}: {
  selected: ReadonlySet<VocaloidId>
  onToggle: (id: VocaloidId) => void
}) {
  const { catalog } = useCatalog()
  const { t, locale } = useLocale()

  return (
    <div role="group" aria-label={t('search.filterByVocaloid')} className="flex flex-wrap gap-1.5">
      {[...catalog.vocaloids.values()].map((vocaloid) => {
        const on = selected.has(vocaloid.id)
        return (
          <button
            key={vocaloid.id}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(vocaloid.id)}
            className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold transition"
            style={
              on
                ? {
                    backgroundColor: `${vocaloid.color}26`,
                    borderColor: vocaloid.color,
                    color: vocaloid.color,
                  }
                : { borderColor: 'var(--surface-border)', color: 'var(--text-muted)' }
            }
          >
            <span
              aria-hidden
              className="size-1.5 rounded-full"
              style={{ backgroundColor: on ? vocaloid.color : 'var(--text-muted)' }}
            />
            {localize(vocaloid.name, locale)}
          </button>
        )
      })}
    </div>
  )
}
