import {
  overallStats,
  producerRanking,
  songRanking,
  vocaloidRanking,
} from '@/application/statistics'
import { useMemo, type ReactNode } from 'react'
import type { Song } from '@/domain/song/Song'
import { localize } from '@/domain/vocaloid/Vocaloid'
import { LuPlus } from 'react-icons/lu'
import { BarRanking, type BarRankingRow } from '@/presentation/components/BarRanking'
import { HelpTip } from '@/presentation/components/HelpTip'
import type { RankingKind } from '@/presentation/hooks/useRoute'
import { useCatalog } from '@/presentation/providers/CatalogProvider'
import { useLocale } from '@/presentation/providers/LocaleProvider'

const RANKING_LIMIT = 5

/** 数と単位。単位はランキングの行と同じく、数より小さく控えめに置く。 */
function StatTile({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="surface-card rounded-xl p-3">
      <p className="text-2xl leading-none font-black tabular-nums">
        {value}
        <span className="text-muted ml-0.5 text-xs">{unit}</span>
      </p>
      <p className="text-muted mt-1 text-xs">{label}</p>
    </div>
  )
}

function Panel({
  title,
  help,
  onShowAll,
  children,
}: {
  title: string
  /** 指定すると、見出しの横に「?」を出してマウスオーバーで説明する。 */
  help?: string
  /** 指定すると、ランキングの下に「もっと見る」ボタンを出す。 */
  onShowAll?: () => void
  children: ReactNode
}) {
  const { t } = useLocale()
  return (
    <section className="surface-card mt-4 rounded-2xl p-4">
      <h3 className="mb-3 flex items-center gap-1.5 text-sm font-bold">
        {title}
        {help !== undefined ? <HelpTip text={help} /> : null}
      </h3>
      {children}
      {onShowAll !== undefined ? (
        <button
          type="button"
          onClick={onShowAll}
          className="text-muted mt-3 inline-flex w-full items-center justify-center gap-1 rounded-lg py-2 text-xs font-semibold transition hover:bg-black/[0.04]"
        >
          <LuPlus aria-hidden />
          {t('statistics.showMore')}
        </button>
      ) : null}
    </section>
  )
}

export function StatisticsView({
  onShowAll,
  onSelectSong,
}: {
  onShowAll: (ranking: RankingKind) => void
  onSelectSong: (song: Song) => void
}) {
  const { catalog } = useCatalog()
  const { t, locale } = useLocale()

  // 集計はカタログ全体を走査する。曲のモーダルを開くだけでも再描画されるので、
  // カタログが変わらないかぎり作り直さない。
  const overall = useMemo(() => overallStats(catalog), [catalog])
  const producers = useMemo(() => producerRanking(catalog).slice(0, RANKING_LIMIT), [catalog])
  const songs = useMemo(() => songRanking(catalog).slice(0, RANKING_LIMIT), [catalog])
  const vocaloids = useMemo(() => vocaloidRanking(catalog), [catalog])

  const producerRows: BarRankingRow[] = producers.map((stat) => ({
    id: stat.producer,
    label: stat.producer,
    value: stat.songCount,
    note: t('statistics.appearances', { count: stat.appearanceCount }),
  }))

  const songRows: BarRankingRow[] = songs.map((stat) => ({
    id: stat.song.title,
    label: stat.song.title,
    value: stat.editionCount,
    onSelect: () => onSelectSong(stat.song),
    ariaLabel: t('a11y.songDetail', { title: stat.song.title }),
  }))

  const vocaloidRows: BarRankingRow[] = vocaloids.map((stat) => ({
    id: stat.vocaloid.id,
    label: localize(stat.vocaloid.name, locale),
    value: stat.songCount,
    accent: stat.vocaloid.color,
  }))

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-6 pb-16">
      {/* statistics.description は画面には出さない。検索向けの meta にだけ使う (App.tsx) */}
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

      <Panel title={t('statistics.producers.title')} onShowAll={() => onShowAll('producers')}>
        <BarRanking rows={producerRows} valueSuffix={t('statistics.unit.songs')} />
      </Panel>

      <Panel
        title={t('statistics.songs.title')}
        help={t('statistics.songs.help')}
        onShowAll={() => onShowAll('songs')}
      >
        <BarRanking rows={songRows} valueSuffix={t('statistics.unit.editions')} />
      </Panel>

      <Panel title={t('statistics.vocaloids.title')} onShowAll={() => onShowAll('vocaloids')}>
        <BarRanking rows={vocaloidRows} valueSuffix={t('statistics.unit.songs')} />
      </Panel>
    </div>
  )
}
