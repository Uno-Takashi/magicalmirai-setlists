import { lazy, Suspense, useState } from 'react'
import type { VocaloidTrendPoint } from '@/application/statistics'
import type { Vocaloid } from '@/domain/vocaloid/Vocaloid'
import { StatsPanel } from '@/presentation/components/statistics/StatsPanel'
import type { TrendMode } from '@/presentation/components/statistics/VocaloidTrendChart'
import { SegmentedControl } from '@/presentation/components/ui/SegmentedControl'
import { useLocale } from '@/presentation/providers/LocaleProvider'

const MODES: readonly TrendMode[] = ['perEdition', 'cumulative']

/**
 * グラフ描画には nivo (と d3) が要る。統計の中の 1 ページでしか使わないので、
 * 本体のバンドルには載せずここだけ別チャンクにする。
 */
const VocaloidTrendChart = lazy(async () => ({
  default: (await import('@/presentation/components/statistics/VocaloidTrendChart'))
    .VocaloidTrendChart,
}))

/**
 * 年ごと / 累積を切り替えられる推移グラフの節。
 * 節ごとに切り替えを持つので、通常の曲数とソロの曲数を別々の見方で並べられる。
 */
export function VocaloidTrendSection({
  title,
  help,
  points,
  vocaloids,
}: {
  title: string
  /** 見出しの「?」に出す説明。切り替えに応じて変える。 */
  help: (mode: TrendMode) => string
  points: readonly VocaloidTrendPoint[]
  vocaloids: readonly Vocaloid[]
}) {
  const { t } = useLocale()
  const [mode, setMode] = useState<TrendMode>('perEdition')

  return (
    <StatsPanel
      title={title}
      help={help(mode)}
      action={
        <SegmentedControl
          label={title}
          options={MODES}
          value={mode}
          onChange={setMode}
          renderLabel={(option) => t(`statistics.vocaloids.trend.${option}`)}
        />
      }
    >
      {/* 読み込み中も高さを保って、グラフが出た瞬間に下がずれないようにする */}
      <Suspense fallback={<div className="h-64 w-full sm:h-80" />}>
        <VocaloidTrendChart points={points} vocaloids={vocaloids} mode={mode} />
      </Suspense>
    </StatsPanel>
  )
}
