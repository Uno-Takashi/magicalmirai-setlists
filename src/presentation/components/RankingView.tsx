import { useMemo } from 'react'
import { producerRanking, songRanking } from '@/application/statistics'
import { producerLabel, type Song } from '@/domain/song/Song'
import { BackToStatistics } from '@/presentation/components/BackToStatistics'
import { BarRanking, type BarRankingRow } from '@/presentation/components/BarRanking'
import { HelpTip } from '@/presentation/components/HelpTip'
import type { RankingKind } from '@/presentation/hooks/useRoute'
import { useCatalog } from '@/presentation/providers/CatalogProvider'
import { useLocale } from '@/presentation/providers/LocaleProvider'

/** 統計ページの上位だけでは足りないときに開く、ランキング全体のページ。 */
export function RankingView({
  ranking,
  onBack,
  onSelectSong,
}: {
  ranking: RankingKind
  /** 統計の全体へ戻る。 */
  onBack: () => void
  onSelectSong: (song: Song) => void
}) {
  const { catalog } = useCatalog()
  const { t } = useLocale()

  // 全件のランキング。行数が多いので、描画のたびに集計し直さない。
  // 表示しない方は空配列で済ませ、必要な集計だけを走らせる。
  const producers = useMemo(
    () => (ranking === 'producers' ? producerRanking(catalog) : []),
    [catalog, ranking],
  )
  const songs = useMemo(() => (ranking === 'songs' ? songRanking(catalog) : []), [catalog, ranking])

  const rows: BarRankingRow[] =
    ranking === 'producers'
      ? producers.map((stat) => ({
          id: stat.producer,
          label: stat.producer,
          value: stat.songCount,
          note: t('statistics.appearances', { count: stat.appearanceCount }),
        }))
      : songs.map((stat) => ({
          id: stat.song.title,
          label: (
            <>
              {stat.song.title}
              {stat.song.producers.length > 0 ? (
                <span className="text-muted ml-1.5 text-xs font-normal">
                  {producerLabel(stat.song)}
                </span>
              ) : null}
            </>
          ),
          value: stat.editionCount,
          onSelect: () => onSelectSong(stat.song),
          ariaLabel: t('a11y.songDetail', { title: stat.song.title }),
        }))

  const title = ranking === 'producers' ? 'statistics.producers.title' : 'statistics.songs.title'
  const unit = ranking === 'producers' ? 'statistics.unit.songs' : 'statistics.unit.editions'

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-6 pb-16">
      <BackToStatistics onBack={onBack} />
      <h2 className="text-miku mt-1 flex items-center gap-2 text-2xl font-black sm:text-3xl">
        {t(title)}
        {ranking === 'songs' ? <HelpTip text={t('statistics.songs.help')} /> : null}
      </h2>
      <p className="text-muted mt-1 text-sm">{t('statistics.results', { count: rows.length })}</p>

      <section className="surface-card mt-4 rounded-2xl p-4">
        <BarRanking rows={rows} valueSuffix={t(unit)} />
      </section>
    </div>
  )
}
