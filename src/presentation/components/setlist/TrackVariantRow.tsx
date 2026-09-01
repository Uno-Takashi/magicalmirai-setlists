import type { Edition } from '@/domain/edition/Edition'
import { variantSingers, type Track, type TrackVariant } from '@/domain/setlist/Track'
import type { Song } from '@/domain/song/Song'
import { ProducerChips } from '@/presentation/components/song/ProducerChips'
import { TrackVariantLabelChip } from '@/presentation/components/setlist/TrackVariantLabelChip'
import { variantLabels } from '@/presentation/components/setlist/trackVariantLabels'
import { VocaloidChips } from '@/presentation/components/vocaloid/VocaloidChips'
import { useCatalog } from '@/presentation/providers/CatalogProvider'
import { useLocale } from '@/presentation/providers/LocaleProvider'
import { usePreferences } from '@/presentation/providers/PreferencesProvider'

/**
 * 曲順の枠に入る候補 1 つ分の行。押すとその曲の詳細を開く。
 *
 * 右側の札はこの候補が「どの回で演奏されたか」。固定曲では何も出ない。
 */
export function TrackVariantRow({
  variant,
  track,
  edition,
  onSelect,
}: {
  variant: TrackVariant
  track: Track
  edition: Edition
  onSelect: (song: Song) => void
}) {
  const { catalog } = useCatalog()
  const { t, locale } = useLocale()
  const { compactTags } = usePreferences()
  const song = catalog.songs.get(variant.song)
  if (song === undefined) return null

  const labels = variantLabels(track, variant, edition, t, locale)

  return (
    <button
      type="button"
      data-song={variant.song}
      onClick={() => onSelect(song)}
      aria-label={t('a11y.songDetail', { title: song.title })}
      className="group flex w-full items-baseline gap-2 rounded-lg px-2 py-1.5 text-left transition hover:bg-black/[0.04]"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium break-words group-hover:underline">
          {song.title}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-1">
          <ProducerChips producers={song.producers} />
          <VocaloidChips singers={variantSingers(variant, song)} />
        </span>
      </span>
      {labels.length > 0 ? (
        // 札は普段は縦に積む (公演地や日程は長くなりがちで、横に並べると曲名を圧迫する)。
        // シンプル表示のときは目印だけになって短いので、横に並べて高さを詰める。
        <span
          className={`flex shrink-0 gap-1 ${compactTags ? 'items-center' : 'flex-col items-end'}`}
        >
          {labels.map((label) => (
            <TrackVariantLabelChip key={label.text} label={label} />
          ))}
        </span>
      ) : null}
    </button>
  )
}
