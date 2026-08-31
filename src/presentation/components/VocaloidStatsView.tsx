import { lazy, Suspense, useMemo, useState } from 'react'
import { vocaloidRanking, vocaloidTrend, type VocaloidTrendPoint } from '@/application/statistics'
import { localize, type Vocaloid } from '@/domain/vocaloid/Vocaloid'
import { BarRanking, type BarRankingRow } from '@/presentation/components/BarRanking'
import { HelpTip } from '@/presentation/components/HelpTip'
import type { TrendMode } from '@/presentation/components/VocaloidTrendChart'
import { useCatalog } from '@/presentation/providers/CatalogProvider'
import { useLocale } from '@/presentation/providers/LocaleProvider'

const MODES: TrendMode[] = ['perEdition', 'cumulative']

/**
 * グラフ描画には nivo (と d3) が要る。統計の中の 1 ページでしか使わないので、
 * 本体のバンドルには載せずここだけ別チャンクにする。
 */
const VocaloidTrendChart = lazy(async () => ({
  default: (await import('@/presentation/components/VocaloidTrendChart')).VocaloidTrendChart,
}))

/**
 * 年ごと / 累積を切り替えられる推移グラフの節。
 * 節ごとに切り替えを持つので、通常の曲数とソロの曲数を別々の見方で並べられる。
 */
function TrendSection({
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
    <section className="surface-card mt-4 rounded-2xl p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h3 className="flex flex-1 items-center gap-1.5 text-sm font-bold">
          {title}
          <HelpTip text={help(mode)} />
        </h3>
        <div
          role="group"
          aria-label={title}
          className="surface-card flex shrink-0 gap-0.5 rounded-lg p-0.5"
        >
          {MODES.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              onClick={() => setMode(value)}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                mode === value ? 'bg-miku/15 text-miku' : 'text-muted hover:bg-black/[0.04]'
              }`}
            >
              {t(`statistics.vocaloids.trend.${value}`)}
            </button>
          ))}
        </div>
      </div>

      {/* 読み込み中も高さを保って、グラフが出た瞬間に下がずれないようにする */}
      <Suspense fallback={<div className="h-64 w-full sm:h-80" />}>
        <VocaloidTrendChart points={points} vocaloids={vocaloids} mode={mode} />
      </Suspense>
    </section>
  )
}

/** ボーカロイド別の曲数を掘り下げるページ。統計ページの「もっと見る」から来る。 */
export function VocaloidStatsView() {
  const { catalog } = useCatalog()
  const { t, locale } = useLocale()

  // どれもカタログ全体を走査するので、カタログが変わらないかぎり作り直さない。
  const ranking = useMemo(() => vocaloidRanking(catalog), [catalog])
  const trend = useMemo(() => vocaloidTrend(catalog), [catalog])
  const soloTrend = useMemo(() => vocaloidTrend(catalog, true), [catalog])

  const rows: BarRankingRow[] = ranking.map((stat) => ({
    id: stat.vocaloid.id,
    label: localize(stat.vocaloid.name, locale),
    value: stat.songCount,
    accent: stat.vocaloid.color,
  }))
  const vocaloids = ranking.map((stat) => stat.vocaloid)

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-6 pb-16">
      <h2 className="text-miku text-2xl font-black sm:text-3xl">
        {t('statistics.vocaloids.title')}
      </h2>
      <p className="text-muted mt-1 text-sm">{t('statistics.vocaloids.description')}</p>

      <section className="surface-card mt-4 rounded-2xl p-4">
        <BarRanking rows={rows} valueSuffix={t('statistics.unit.songs')} />
      </section>

      <TrendSection
        title={t('statistics.vocaloids.trend.title')}
        help={(mode) => t(`statistics.vocaloids.trend.${mode}Help`)}
        points={trend}
        vocaloids={vocaloids}
      />

      <TrendSection
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
