import { motion } from 'motion/react'
import { useMemo } from 'react'
import { sessionIndex, type Edition } from '@/domain/edition/Edition'
import type { Track } from '@/domain/setlist/Track'
import { classifyVariation, variationAxes } from '@/domain/setlist/TrackVariation'
import type { Song } from '@/domain/song/Song'
import { TrackTags } from '@/presentation/components/setlist/TrackTags'
import { TrackVariantRow } from '@/presentation/components/setlist/TrackVariantRow'
import { TrackVariationBadges } from '@/presentation/components/setlist/TrackVariationBadges'

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
  // 昼夜で入れ替わるだけの枠を見分けるのに、公演回の昼/夜を引けるようにする
  const sessions = useMemo(() => sessionIndex(edition), [edition])
  const axes = variationAxes(classifyVariation(track, (ref) => sessions.get(ref)))
  const hasHeader = track.tags.length > 0 || axes.length > 0

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
        {hasHeader ? (
          <div className="mb-1 flex flex-wrap items-center gap-1 px-2">
            <TrackTags tags={track.tags} />
            <TrackVariationBadges axes={axes} />
          </div>
        ) : null}
        {/* 入れ替わる枠は候補の並びを縦線でくくり、1 枠のうちの選択肢だと分かるようにする */}
        <div
          className={
            axes.length > 0 ? 'border-l-2 border-[color:var(--surface-border)] pl-1' : undefined
          }
        >
          {track.variants.map((variant) => (
            <TrackVariantRow
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
