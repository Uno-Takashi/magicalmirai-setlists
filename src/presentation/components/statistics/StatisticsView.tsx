import { useMemo } from 'react'
import {
  overallStats,
  producerRanking,
  songRanking,
  vocaloidRanking,
} from '@/application/statistics'
import { BarRanking } from '@/presentation/components/statistics/BarRanking'
import {
  producerRows,
  songRows,
  vocaloidRows,
} from '@/presentation/components/statistics/rankingRows'
import { StatsPanel } from '@/presentation/components/statistics/StatsPanel'
import { StatTile } from '@/presentation/components/statistics/StatTile'
import { useCatalog } from '@/presentation/providers/CatalogProvider'
import { useDialogs } from '@/presentation/providers/DialogsProvider'
import { useLocale } from '@/presentation/providers/LocaleProvider'
import { useNavigation } from '@/presentation/providers/NavigationProvider'

/** 統計ページに出す上位の件数。続きは掘り下げのページで見せる。 */
const RANKING_LIMIT = 5

/** 全体の要約。数の並びと、主なランキングの上位だけを出す。 */
export function StatisticsView() {
  const { catalog } = useCatalog()
  const { t, locale } = useLocale()
  const { openRanking } = useNavigation()
  const { showSong, openSearch } = useDialogs()

  // 集計はカタログ全体を走査する。曲のモーダルを開くだけでも再描画されるので、
  // カタログが変わらないかぎり作り直さない。
  const overall = useMemo(() => overallStats(catalog), [catalog])
  const producers = useMemo(() => producerRanking(catalog).slice(0, RANKING_LIMIT), [catalog])
  const songs = useMemo(() => songRanking(catalog).slice(0, RANKING_LIMIT), [catalog])
  const vocaloids = useMemo(() => vocaloidRanking(catalog), [catalog])

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-6 pb-16">
      {/* statistics.description は画面には出さない。検索向けの meta にだけ使う (usePageMeta) */}
      <h2 className="text-miku text-2xl font-black sm:text-3xl">{t('statistics.title')}</h2>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <StatTile
          label={t('statistics.editionCount')}
          value={overall.editionCount}
          unit={t('statistics.unit.editions')}
        />
        <StatTile
          label={t('statistics.performanceCount')}
          value={overall.performanceCount}
          unit={t('statistics.unit.times')}
        />
        <StatTile
          label={t('statistics.producerCount')}
          value={overall.producerCount}
          unit={t('statistics.unit.people')}
        />
      </div>

      <StatsPanel
        title={t('statistics.producers.title')}
        onShowAll={() => openRanking('producers')}
      >
        <BarRanking
          rows={producerRows(producers, t, (producer) => openSearch(producer))}
          valueSuffix={t('statistics.unit.songs')}
        />
      </StatsPanel>

      <StatsPanel
        title={t('statistics.songs.title')}
        help={t('statistics.songs.help')}
        onShowAll={() => openRanking('songs')}
      >
        <BarRanking
          rows={songRows(songs, t, showSong)}
          valueSuffix={t('statistics.unit.editions')}
        />
      </StatsPanel>

      <StatsPanel
        title={t('statistics.vocaloids.title')}
        onShowAll={() => openRanking('vocaloids')}
      >
        <BarRanking
          rows={vocaloidRows(vocaloids, locale)}
          valueSuffix={t('statistics.unit.songs')}
        />
      </StatsPanel>
    </div>
  )
}
