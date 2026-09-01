import { useMemo } from 'react'
import { producerRanking, songRanking } from '@/application/statistics'
import { rankingTitleKey } from '@/presentation/hooks/usePageMeta'
import type { RankingKind } from '@/presentation/hooks/useRoute'
import { BackToStatistics } from '@/presentation/components/statistics/BackToStatistics'
import { BarRanking } from '@/presentation/components/statistics/BarRanking'
import { producerRows, songRows } from '@/presentation/components/statistics/rankingRows'
import { StatsPanel } from '@/presentation/components/statistics/StatsPanel'
import { HelpTip } from '@/presentation/components/ui/HelpTip'
import { useCatalog } from '@/presentation/providers/CatalogProvider'
import { useDialogs } from '@/presentation/providers/DialogsProvider'
import { useLocale } from '@/presentation/providers/LocaleProvider'
import { useNavigation } from '@/presentation/providers/NavigationProvider'

/** 統計ページの上位だけでは足りないときに開く、ランキング全体のページ。 */
export function RankingView({ ranking }: { ranking: Exclude<RankingKind, 'vocaloids'> }) {
  const { catalog } = useCatalog()
  const { t } = useLocale()
  const { openStatistics } = useNavigation()
  const { showSong, openSearch } = useDialogs()

  // 全件のランキング。行数が多いので、描画のたびに集計し直さない。
  // 表示しない方は空配列で済ませ、必要な集計だけを走らせる。
  const producers = useMemo(
    () => (ranking === 'producers' ? producerRanking(catalog) : []),
    [catalog, ranking],
  )
  const songs = useMemo(() => (ranking === 'songs' ? songRanking(catalog) : []), [catalog, ranking])

  const rows =
    ranking === 'producers'
      ? producerRows(producers, t, (producer) => openSearch(producer))
      : // 行数が多いので、曲名だけでは見分けづらい。作曲者も添える。
        songRows(songs, t, showSong, true)
  const unit = ranking === 'producers' ? 'statistics.unit.songs' : 'statistics.unit.editions'

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-6 pb-16">
      <BackToStatistics onBack={openStatistics} />
      <h2 className="text-miku mt-1 flex items-center gap-2 text-2xl font-black sm:text-3xl">
        {t(rankingTitleKey(ranking))}
        {ranking === 'songs' ? <HelpTip text={t('statistics.songs.help')} /> : null}
      </h2>
      <p className="text-muted mt-1 text-sm">{t('statistics.results', { count: rows.length })}</p>

      <StatsPanel>
        <BarRanking rows={rows} valueSuffix={t(unit)} />
      </StatsPanel>
    </div>
  )
}
