import { useMemo } from 'react'
import { vocaloidRanking, vocaloidTrend } from '@/application/statistics'
import { BackToStatistics } from '@/presentation/components/statistics/BackToStatistics'
import { BarRanking } from '@/presentation/components/statistics/BarRanking'
import { vocaloidRows } from '@/presentation/components/statistics/rankingRows'
import { StatsPanel } from '@/presentation/components/statistics/StatsPanel'
import { VocaloidTrendSection } from '@/presentation/components/statistics/VocaloidTrendSection'
import { useCatalog } from '@/presentation/providers/CatalogProvider'
import { useLocale } from '@/presentation/providers/LocaleProvider'
import { useNavigation } from '@/presentation/providers/NavigationProvider'

/** ボーカロイド別の曲数を掘り下げるページ。統計ページの「もっと見る」から来る。 */
export function VocaloidStatsView() {
  const { catalog } = useCatalog()
  const { t, locale } = useLocale()
  const { openStatistics } = useNavigation()

  // どれもカタログ全体を走査するので、カタログが変わらないかぎり作り直さない。
  const ranking = useMemo(() => vocaloidRanking(catalog), [catalog])
  const trend = useMemo(() => vocaloidTrend(catalog), [catalog])
  const soloTrend = useMemo(() => vocaloidTrend(catalog, true), [catalog])
  const vocaloids = ranking.map((stat) => stat.vocaloid)

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-6 pb-16">
      <BackToStatistics onBack={openStatistics} />
      <h2 className="text-miku mt-1 text-2xl font-black sm:text-3xl">
        {t('statistics.vocaloids.title')}
      </h2>
      <p className="text-muted mt-1 text-sm">{t('statistics.vocaloids.description')}</p>

      <StatsPanel>
        <BarRanking rows={vocaloidRows(ranking, locale)} valueSuffix={t('statistics.unit.songs')} />
      </StatsPanel>

      <VocaloidTrendSection
        title={t('statistics.vocaloids.trend.title')}
        help={(mode) => t(`statistics.vocaloids.trend.${mode}Help`)}
        points={trend}
        vocaloids={vocaloids}
      />

      <VocaloidTrendSection
        title={t('statistics.vocaloids.solo.title')}
        help={(mode) =>
          `${t('statistics.vocaloids.solo.help')} ${t(`statistics.vocaloids.trend.${mode}Help`)}`
        }
        points={soloTrend}
        vocaloids={vocaloids}
      />
    </div>
  )
}
