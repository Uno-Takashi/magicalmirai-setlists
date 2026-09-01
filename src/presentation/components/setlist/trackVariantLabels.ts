/**
 * 候補の「どの回で演奏されたか」を、札に出す文言へ開く。
 *
 * 入れ替わりの軸そのもの (会場替わり / 昼夜入れ替え / 日程替わり) はドメインが
 * 決める (`TrackVariation`)。ここはそれを人が読む形に直すだけの表示の都合なので、
 * ドメインには置かない。
 */

import type { IconType } from 'react-icons'
import { LuMapPin } from 'react-icons/lu'
import { TbBrandDaysCounter } from 'react-icons/tb'
import type { Edition } from '@/domain/edition/Edition'
import type { Performance } from '@/domain/edition/Performance'
import type { Session } from '@/domain/edition/Show'
import {
  performanceIdOf,
  showIdOf,
  type ShowRef,
  type Track,
  type TrackVariant,
} from '@/domain/setlist/Track'
import { variantScope } from '@/domain/setlist/TrackVariation'
import { localize } from '@/domain/vocaloid/Vocaloid'
import { SESSION_ICON } from '@/presentation/components/edition/sessionVisuals'
import type { Locale, Translate } from '@/infrastructure/i18n/i18n'

/**
 * 札に並べる「何日目のどの回か」。
 *
 * `sessions` はその日の一部の回だけのときに入る。丸ごと 1 日なら空にして、
 * 太陽と三日月を並べない (どの日にも両方が付くと、目印として働かないため)。
 */
export interface DayMark {
  readonly day: string
  readonly sessions: readonly Session[]
}

export interface VariantLabel {
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
export function variantLabels(
  track: Track,
  variant: TrackVariant,
  edition: Edition,
  t: Translate,
  locale: Locale,
): readonly VariantLabel[] {
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
  return host === undefined
    ? []
    : [{ text: '', icon: TbBrandDaysCounter, days: dayMarks(host, scope.showIds) }]
}
