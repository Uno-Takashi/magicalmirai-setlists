import { RankingView } from '@/presentation/components/statistics/RankingView'
import { StatisticsView } from '@/presentation/components/statistics/StatisticsView'
import { VocaloidStatsView } from '@/presentation/components/statistics/VocaloidStatsView'
import type { Route } from '@/presentation/hooks/useRoute'

/**
 * 統計のページ。全体の要約と、そこから掘り下げる各ランキングを振り分ける。
 *
 * ボーカロイドだけは棒グラフに加えて推移のグラフを持つので、別の画面にしている。
 */
export function StatisticsPage({
  route,
}: {
  route: Extract<Route, { kind: 'statistics' | 'ranking' }>
}) {
  return (
    <main className="flex-1">
      {route.kind === 'statistics' ? (
        <StatisticsView />
      ) : route.ranking === 'vocaloids' ? (
        <VocaloidStatsView />
      ) : (
        <RankingView ranking={route.ranking} />
      )}
    </main>
  )
}
