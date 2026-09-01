/**
 * 統計の集計結果を、横棒ランキングの行に直す。
 *
 * 統計ページ (上位だけ) と掘り下げのページ (全件) が同じ表を出すので、
 * 行の作り方をここにまとめて、2 か所で文言や導線がずれないようにする。
 */

import type { ProducerStat, SongStat, VocaloidStat } from '@/application/statistics'
import { producerLabel, type Song } from '@/domain/song/Song'
import { localize } from '@/domain/vocaloid/Vocaloid'
import type { BarRankingRow } from '@/presentation/components/statistics/BarRanking'
import type { Locale, Translate } from '@/infrastructure/i18n/i18n'

/** ボカロ P の行。押すとその名前で曲を探しに行く。 */
export function producerRows(
  stats: readonly ProducerStat[],
  t: Translate,
  onSelect: (producer: string) => void,
): BarRankingRow[] {
  return stats.map((stat) => ({
    id: stat.producer,
    label: stat.producer,
    value: stat.songCount,
    note: t('statistics.appearances', { count: stat.appearanceCount }),
    onSelect: () => onSelect(stat.producer),
    ariaLabel: t('a11y.searchProducer', { producer: stat.producer }),
  }))
}

/**
 * 曲の行。押すとその曲の詳細を開く。
 *
 * `showProducers` は全件のページ向け。行数が多いと曲名だけでは見分けづらいので
 * 作曲者を添える。上位だけを出す統計ページでは付けない。
 */
export function songRows(
  stats: readonly SongStat[],
  t: Translate,
  onSelect: (song: Song) => void,
  showProducers = false,
): BarRankingRow[] {
  return stats.map((stat) => ({
    id: stat.song.title,
    label: stat.song.title,
    sublabel:
      showProducers && stat.song.producers.length > 0 ? producerLabel(stat.song) : undefined,
    value: stat.editionCount,
    onSelect: () => onSelect(stat.song),
    ariaLabel: t('a11y.songDetail', { title: stat.song.title }),
  }))
}

/** ボーカロイドの行。押せる先が無いので、行頭にテーマカラーを添えるだけにする。 */
export function vocaloidRows(stats: readonly VocaloidStat[], locale: Locale): BarRankingRow[] {
  return stats.map((stat) => ({
    id: stat.vocaloid.id,
    label: localize(stat.vocaloid.name, locale),
    value: stat.songCount,
    accent: stat.vocaloid.color,
  }))
}
