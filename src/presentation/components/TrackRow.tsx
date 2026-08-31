import { motion } from 'motion/react'
import { LuCalendarRange, LuMapPin, LuShuffle } from 'react-icons/lu'
import type { Edition } from '@/domain/edition/Edition'
import { showIdOf, variantSingers, type Track, type TrackVariant } from '@/domain/setlist/Track'
import {
  classifyVariation,
  variantScope,
  variationAxes,
  type VariationAxis,
} from '@/domain/setlist/TrackVariation'
import { producerLabel, type Song } from '@/domain/song/Song'
import { localize } from '@/domain/vocaloid/Vocaloid'
import { TrackTags } from '@/presentation/components/TrackTags'
import { VocaloidChips } from '@/presentation/components/VocaloidChips'
import { useCatalog } from '@/presentation/providers/CatalogProvider'
import { useLocale } from '@/presentation/providers/LocaleProvider'

interface VariantRowProps {
  variant: TrackVariant
  track: Track
  edition: Edition
  onSelect: (song: Song) => void
}

interface VariantLabel {
  readonly text: string
  /** 公演地で分かれている候補。地図ピンを添えて、日程の札と一目で見分けられるようにする。 */
  readonly byVenue: boolean
}

/** 候補が「どの回で演奏されたか」を短い文字列にする。 */
function useVariantLabel(track: Track, variant: TrackVariant, edition: Edition): VariantLabel {
  const { t, locale } = useLocale()
  const scope = variantScope(track, variant)
  if (scope === null) return { text: variant.note ?? '', byVenue: false }

  // 公演地はピンが付くので「大阪公演」まで書かず、地名だけにする
  if (scope.kind === 'venues') {
    return {
      text: scope.performanceIds
        .map((id) => {
          const performance = edition.performances.find((p) => p.id === id)
          return performance ? localize(performance.city, locale) : id
        })
        .join('・'),
      byVenue: true,
    }
  }

  const ids = scope.kind === 'shows' ? scope.showIds : scope.shows.map(showIdOf)
  const matched = edition.performances.flatMap((performance) =>
    performance.shows.filter((show) => ids.includes(show.id)),
  )

  // 昼だけ・夜だけで揃っているなら、日付を並べるより「昼公演」の方が読みやすい
  const sessions = new Set(matched.map((show) => show.session))
  if (sessions.size === 1) {
    const [session] = [...sessions]
    if (session !== undefined) return { text: t(`session.${session}`), byVenue: false }
  }

  return { text: [...new Set(matched.map((show) => show.label))].sort().join('・'), byVenue: false }
}

function VariantRow({ variant, track, edition, onSelect }: VariantRowProps) {
  const { catalog } = useCatalog()
  const { t } = useLocale()
  const label = useVariantLabel(track, variant, edition)
  const song = catalog.songs.get(variant.song)
  if (song === undefined) return null

  const singers = variantSingers(variant, song)

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
        <span className="text-muted mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          {song.producers.length > 0 ? (
            <span className="break-words">{producerLabel(song)}</span>
          ) : null}
          <VocaloidChips singers={singers} />
        </span>
      </span>
      {label.text !== '' ? (
        <span className="surface-card text-muted inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[10px] whitespace-nowrap">
          {label.byVenue ? <LuMapPin aria-hidden /> : null}
          {label.text}
        </span>
      ) : null}
    </button>
  )
}

const VARIATION_ICON = {
  venue: LuMapPin,
  schedule: LuCalendarRange,
  daily: LuShuffle,
} as const

/** セットリストの 1 枠。曲順・タグ・入れ替わりの軸と、候補の並びを出す。 */
export function TrackRow({
  track,
  edition,
  index,
  onSelect,
}: {
  track: Track
  edition: Edition
  /** 並び順。上から順に現れるアニメーションの遅延に使う。 */
  index: number
  onSelect: (song: Song) => void
}) {
  const { t } = useLocale()
  const badges: readonly VariationAxis[] = variationAxes(classifyVariation(track))

  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.015, 0.4), duration: 0.28 }}
      className="flex gap-3 py-1.5"
    >
      <span className="text-muted w-7 shrink-0 pt-2 text-right text-xs tabular-nums">
        {track.order}
      </span>
      <div className="min-w-0 flex-1">
        {track.tags.length > 0 || badges.length > 0 ? (
          <div className="mb-1 flex flex-wrap items-center gap-1 px-2">
            <TrackTags tags={track.tags} />
            {badges.map((kind) => {
              const Icon = VARIATION_ICON[kind]
              return (
                <span
                  key={kind}
                  className="text-muted inline-flex items-center gap-1 rounded bg-slate-400/15 px-1.5 py-0.5 text-[10px] font-semibold"
                >
                  <Icon aria-hidden />
                  {t(`track.variation.${kind}`)}
                </span>
              )
            })}
          </div>
        ) : null}
        <div
          className={
            badges.length > 0 ? 'border-l-2 border-[color:var(--surface-border)] pl-1' : undefined
          }
        >
          {track.variants.map((variant) => (
            <VariantRow
              key={variant.song}
              variant={variant}
              track={track}
              edition={edition}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </motion.li>
  )
}
