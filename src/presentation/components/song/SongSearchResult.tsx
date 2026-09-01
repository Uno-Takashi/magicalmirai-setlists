import type { SongSearchHit } from '@/application/searchSongs'
import { singersOfSong } from '@/application/searchSongs'
import { producerLabel, type Song } from '@/domain/song/Song'
import { EditionYearBadge } from '@/presentation/components/edition/EditionYearBadge'
import { VocaloidChips } from '@/presentation/components/vocaloid/VocaloidChips'
import { useCatalog } from '@/presentation/providers/CatalogProvider'
import { useLocale } from '@/presentation/providers/LocaleProvider'

/**
 * 検索結果の 1 曲。曲名を押すと詳細、年の札を押すとその年のセットリストへ移る。
 *
 * 曲名と年の 2 つの行き先を持つので、カード全体は押せるようにしない。
 */
export function SongSearchResult({
  hit,
  onSelectSong,
  onSelectEdition,
}: {
  hit: SongSearchHit
  onSelectSong: (song: Song) => void
  onSelectEdition: (slug: string) => void
}) {
  const { catalog, searchIndex } = useCatalog()
  const { t } = useLocale()
  const { song, editions } = hit

  return (
    <div className="surface-card rounded-xl p-3">
      <button
        type="button"
        onClick={() => onSelectSong(song)}
        aria-label={t('a11y.songDetail', { title: song.title })}
        className="block w-full text-left"
      >
        <span className="block text-sm font-semibold hover:underline">{song.title}</span>
        {song.producers.length > 0 ? (
          <span className="text-muted block text-xs">{producerLabel(song)}</span>
        ) : null}
        <span className="mt-1 block">
          <VocaloidChips singers={singersOfSong(catalog, searchIndex, song.title)} />
        </span>
      </button>

      <div className="mt-2 flex flex-wrap items-center gap-1">
        <span className="text-muted mr-1 text-[10px]">{t('search.appearedIn')}</span>
        {editions.map((edition) => (
          <EditionYearBadge
            key={edition.slug}
            year={edition.year}
            onSelect={() => onSelectEdition(edition.slug)}
          />
        ))}
      </div>
    </div>
  )
}
