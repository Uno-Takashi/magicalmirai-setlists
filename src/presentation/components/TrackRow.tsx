import { motion } from 'motion/react'
import { useMemo } from 'react'
import { FaUserPen } from 'react-icons/fa6'
import type { IconType } from 'react-icons'
import { LuCalendarRange, LuMapPin, LuMoon, LuShuffle, LuSun } from 'react-icons/lu'
import { TbSwitchHorizontal } from 'react-icons/tb'
import { sessionIndex, type Edition } from '@/domain/edition/Edition'
import type { Performance } from '@/domain/edition/Performance'
import type { Session } from '@/domain/edition/Show'
import {
  performanceIdOf,
  showIdOf,
  variantSingers,
  type ShowRef,
  type Track,
  type TrackVariant,
} from '@/domain/setlist/Track'
import {
  classifyVariation,
  variantScope,
  variationAxes,
  type VariationAxis,
} from '@/domain/setlist/TrackVariation'
import type { Song } from '@/domain/song/Song'
import { localize } from '@/domain/vocaloid/Vocaloid'
import { TrackTags } from '@/presentation/components/TrackTags'
import { VocaloidChips } from '@/presentation/components/VocaloidChips'
import { useCatalog } from '@/presentation/providers/CatalogProvider'
import { useLocale } from '@/presentation/providers/LocaleProvider'

/** 日替わりなどの札と同じ、地に沈むチップの配色。作曲者のチップもこれに揃える。 */
const MUTED_CHIP = 'text-muted bg-slate-400/15'

interface VariantRowProps {
  variant: TrackVariant
  track: Track
  edition: Edition
  onSelect: (song: Song) => void
}

/**
 * 札に並べる「何日目のどの回か」。
 *
 * `sessions` はその日の一部の回だけのときに入る。丸ごと 1 日なら空にして、
 * 太陽と三日月を並べない (どの日にも両方が付くと、目印として働かないため)。
 */
interface DayMark {
  readonly day: string
  readonly sessions: readonly Session[]
}

interface VariantLabel {
  readonly text: string
  /**
   * 文言の頭に添えるアイコン。公演地なら地図ピン、昼夜なら太陽と三日月を出して、
   * 何で分かれた候補なのかを一目で見分けられるようにする。
   * 色は札の文字色をそのまま継ぐので指定しない。
   */
  readonly icon?: IconType
  /** 公演地の札に並べる日程。日替わりの候補だけが持つ。 */
  readonly days?: readonly DayMark[]
}

/** 昼夜のアイコン。公演地カードの `SessionMark` と同じ絵を使う。 */
const SESSION_ICON = { matinee: LuSun, evening: LuMoon } as const

/** その公演で演奏された回を「何日目の昼/夜か」に開く。 */
function dayMarks(performance: Performance, showIds: readonly string[]): readonly DayMark[] {
  // 何日目かは公演回 id ではなく開催日の並びで数える (id の付け方に依存しない)
  const dates = [...new Set(performance.shows.map((show) => show.date))].sort()
  return dates.flatMap((date, index) => {
    const onThatDay = performance.shows.filter((show) => show.date === date)
    const played = onThatDay.filter((show) => showIds.includes(show.id))
    if (played.length === 0) return []

    // 丸ごと 1 日なら昼夜を言う必要がない
    const sessions =
      played.length === onThatDay.length
        ? []
        : played.flatMap((show) => (show.session === undefined ? [] : [show.session]))
    return [{ day: `Day.${index + 1}`, sessions }]
  })
}

/**
 * 参照を公演地ごとにまとめる。
 *
 * 日替わりの候補は公演地も日もまたぐので、1 つの札にまとめると候補どうしの
 * 違いが読み取れない (2024 年のように、どの候補も同じ札になってしまう)。
 * 公演地ごとに札を分けて、その中に日と昼夜を並べる。
 */
function marksByPerformance(edition: Edition, refs: readonly ShowRef[]) {
  return edition.performances.flatMap((performance) => {
    const showIds = refs.filter((ref) => performanceIdOf(ref) === performance.id).map(showIdOf)
    if (showIds.length === 0) return []
    return [{ performance, days: dayMarks(performance, showIds) }]
  })
}

/** 候補が「どの回で演奏されたか」を札に開く。日替わりは公演地ごとに札を分ける。 */
function useVariantLabels(
  track: Track,
  variant: TrackVariant,
  edition: Edition,
): readonly VariantLabel[] {
  const { t, locale } = useLocale()
  const scope = variantScope(track, variant)
  if (scope === null) return variant.note === undefined ? [] : [{ text: variant.note }]

  // 公演地はピンが付くので「大阪公演」まで書かず、地名だけにする
  if (scope.kind === 'venues') {
    return [
      {
        text: scope.performanceIds
          .map((id) => {
            const performance = edition.performances.find((p) => p.id === id)
            return performance ? localize(performance.city, locale) : id
          })
          .join('・'),
        icon: LuMapPin,
      },
    ]
  }

  // 公演地も日もまたぐ日替わり。公演地ごとに「Day.1 昼」の形で並べる
  if (scope.kind === 'mixed') {
    return marksByPerformance(edition, scope.shows).map(({ performance, days }) => ({
      text: localize(performance.city, locale),
      icon: LuMapPin,
      days,
    }))
  }

  const matched = edition.performances.flatMap((performance) =>
    performance.shows.filter((show) => scope.showIds.includes(show.id)),
  )

  // 昼だけ・夜だけで揃っているなら、日付を並べるより「昼公演」の方が読みやすい
  const sessions = new Set(matched.map((show) => show.session))
  if (sessions.size === 1) {
    const [session] = [...sessions]
    if (session !== undefined) {
      return [{ text: t(`session.${session}`), icon: SESSION_ICON[session] }]
    }
  }

  // 会場では出し分けられていないので、公演地は書かずに日程だけ並べる。
  // どの公演地でも同じ日程なので、その公演回を持つ最初の公演地で数える。
  const host = edition.performances.find((performance) =>
    performance.shows.some((show) => scope.showIds.includes(show.id)),
  )
  return host === undefined ? [] : [{ text: '', days: dayMarks(host, scope.showIds) }]
}

/** 候補の右に出す札。公演地・日程・昼夜のどれで分かれた候補かを示す。 */
function VariantLabelChip({ label }: { label: VariantLabel }) {
  const Icon = label.icon
  if (label.text === '' && label.days === undefined) return null

  return (
    <span className="surface-card text-muted inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] whitespace-nowrap">
      {Icon !== undefined ? <Icon aria-hidden /> : null}
      {label.text}
      {label.days?.map(({ day, sessions }) => (
        <span key={day} className="inline-flex items-center gap-0.5">
          {day}
          {sessions.map((session) => {
            const SessionIcon = SESSION_ICON[session]
            return <SessionIcon key={session} aria-hidden />
          })}
        </span>
      ))}
    </span>
  )
}

function VariantRow({ variant, track, edition, onSelect }: VariantRowProps) {
  const { catalog } = useCatalog()
  const { t } = useLocale()
  const labels = useVariantLabels(track, variant, edition)
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
        <span className="mt-1 flex flex-wrap items-center gap-1">
          {/* 合作は 1 つにまとめず、作曲者ごとにチップを分ける。 */}
          {song.producers.map((producer) => (
            <span
              key={producer}
              className={`${MUTED_CHIP} inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] leading-none font-medium break-all`}
            >
              <FaUserPen className="shrink-0 text-[8px] opacity-70" aria-hidden />
              {producer}
            </span>
          ))}
          <VocaloidChips singers={singers} />
        </span>
      </span>
      {labels.length > 0 ? (
        <span className="flex shrink-0 flex-col items-end gap-1">
          {labels.map((label) => (
            <VariantLabelChip key={label.text} label={label} />
          ))}
        </span>
      ) : null}
    </button>
  )
}

const VARIATION_ICON = {
  venue: LuMapPin,
  session: TbSwitchHorizontal,
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
  // 昼夜で入れ替わるだけの枠を見分けるのに、公演回の昼/夜を引けるようにする
  const sessions = useMemo(() => sessionIndex(edition), [edition])
  const badges: readonly VariationAxis[] = variationAxes(
    classifyVariation(track, (ref) => sessions.get(ref)),
  )

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
                  className={`${MUTED_CHIP} inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold`}
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
