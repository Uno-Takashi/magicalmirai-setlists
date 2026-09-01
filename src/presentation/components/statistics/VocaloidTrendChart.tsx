import { ResponsiveLine } from '@nivo/line'
import { useMemo } from 'react'
import type { VocaloidTrendPoint } from '@/application/statistics'
import { localize, type Vocaloid } from '@/domain/vocaloid/Vocaloid'
import { useLocale } from '@/presentation/providers/LocaleProvider'

export type TrendMode = 'perEdition' | 'cumulative'

/**
 * nivo のテーマ。CSS 変数はそのまま渡せないので、index.css と同じ値を持つ。
 * 色を変えるときは index.css の --text-muted / --surface-border と揃えること。
 */
const CHART_THEME = {
  text: { fontSize: 11, fill: '#64748b', fontFamily: 'inherit' },
  axis: {
    ticks: { line: { stroke: 'transparent' }, text: { fill: '#64748b' } },
    domain: { line: { stroke: 'rgb(15 23 42 / 0.1)' } },
  },
  grid: { line: { stroke: 'rgb(15 23 42 / 0.06)' } },
  legends: { text: { fontSize: 11, fill: '#0f172a' } },
  tooltip: {
    container: {
      background: '#ffffff',
      color: '#0f172a',
      fontSize: 12,
      borderRadius: 8,
      border: '1px solid rgb(15 23 42 / 0.1)',
      boxShadow: '0 8px 24px rgb(15 23 42 / 0.12)',
    },
  },
} as const

/**
 * 開催回ごとのボーカロイド別曲数を、1 枚の折れ線グラフにまとめる。
 *
 * 系列の色はそれぞれのテーマカラー。キャラクターの色なので加工しない。
 * ただし鏡音レンや巡音ルカのような淡い色は白地の細い線だと沈むため、
 * 線を太くし、点に白い縁を付けて輪郭が出るようにしている。
 */
export function VocaloidTrendChart({
  points,
  vocaloids,
  mode,
}: {
  points: readonly VocaloidTrendPoint[]
  /** 表示する順。曲数の多い順で渡す。凡例もこの順に並ぶ。 */
  vocaloids: readonly Vocaloid[]
  mode: TrendMode
}) {
  const { t, locale } = useLocale()

  const series = useMemo(
    () =>
      vocaloids.map((vocaloid) => ({
        id: localize(vocaloid.name, locale),
        color: vocaloid.color,
        data: points.map((point) => ({
          x: point.edition.slug,
          y: point[mode].get(vocaloid.id) ?? 0,
        })),
      })),
    [locale, mode, points, vocaloids],
  )

  return (
    <>
      <div
        className="h-64 w-full sm:h-80"
        role="img"
        aria-label={t(mode === 'cumulative' ? 'a11y.vocaloidTrendTotal' : 'a11y.vocaloidTrend')}
      >
        <ResponsiveLine
          data={series}
          theme={CHART_THEME}
          colors={{ datum: 'color' }}
          margin={{ top: 12, right: 16, bottom: 40, left: 40 }}
          xScale={{ type: 'point' }}
          // 0 を基準にしないと増え方の印象が変わるので、下端は必ず 0 に固定する
          yScale={{ type: 'linear', min: 0, max: 'auto' }}
          axisTop={null}
          axisRight={null}
          axisBottom={{ tickSize: 0, tickPadding: 8, tickRotation: -45 }}
          axisLeft={{ tickSize: 0, tickPadding: 6, tickValues: 5 }}
          enableGridX={false}
          lineWidth={3}
          pointSize={7}
          // 中を白く抜いて線の色で縁取る。塗り潰すと線が重なった所で前後が読めない
          pointColor="#ffffff"
          pointBorderWidth={2}
          pointBorderColor={{ from: 'serieColor' }}
          useMesh
          // 同じ回の全員を 1 つの吹き出しにまとめる。1 人ずつ出すより比較しやすい
          enableSlices="x"
          sliceTooltip={({ slice }) => (
            <div className="surface-card rounded-lg px-2.5 py-2 text-xs shadow-lg">
              <p className="mb-1 font-bold tabular-nums">{String(slice.points[0]?.data.x ?? '')}</p>
              <ul className="grid gap-0.5">
                {/* 既定では系列の逆順に来るので、凡例と同じ曲数の多い順に戻す */}
                {[...slice.points].reverse().map((point) => (
                  <li key={point.id} className="flex items-center gap-1.5 whitespace-nowrap">
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: point.seriesColor }}
                      aria-hidden
                    />
                    <span className="flex-1">{point.seriesId}</span>
                    <span className="ml-2 font-bold tabular-nums">{String(point.data.y)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        />
      </div>

      {/* 凡例は nivo に任せず HTML で描く。折り返せないと狭い画面で端が切れるため */}
      <ul className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs">
        {series.map((serie) => (
          <li key={serie.id} className="flex items-center gap-1.5">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: serie.color }}
              aria-hidden
            />
            {serie.id}
          </li>
        ))}
      </ul>
    </>
  )
}
