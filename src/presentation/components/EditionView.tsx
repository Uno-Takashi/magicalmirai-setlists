import { Tooltip } from '@heroui/react'
import { useMemo, useState } from 'react'
import { LuGlobe } from 'react-icons/lu'
import { performedTracks, setlistFor } from '@/domain/setlist/Setlist'
import type { EditionEntry } from '@/domain/catalog/Catalog'
import { editionPeriod } from '@/domain/edition/Edition'
import type { Performance } from '@/domain/edition/Performance'
import { parseEventDate } from '@/domain/edition/Show'
import type { Song } from '@/domain/song/Song'
import { localize } from '@/domain/vocaloid/Vocaloid'
import { titleImageOf } from '@/infrastructure/dataset/titleImages'
import { PerformanceDialog } from '@/presentation/components/PerformanceDialog'
import { PerformanceRail } from '@/presentation/components/PerformanceRail'
import { SetlistTimeline } from '@/presentation/components/SetlistTimeline'
import { useDateFormatters } from '@/presentation/hooks/useFormatters'
import { useLocale } from '@/presentation/providers/LocaleProvider'

export function EditionView({
  entry,
  focusSong,
  onSelectSong,
  onFocusHandled,
}: {
  entry: EditionEntry
  focusSong?: string | null
  onSelectSong: (song: Song) => void
  onFocusHandled?: () => void
}) {
  const { edition, setlists } = entry
  const { t, locale } = useLocale()
  const formatters = useDateFormatters()

  const [selectedPerformanceId, setSelectedPerformanceId] = useState(
    () => edition.performances[0]?.id ?? '',
  )
  // 会場情報のモーダル。公演の選択とは独立で、見ている公演を変えずに開ける。
  const [detailPerformance, setDetailPerformance] = useState<Performance | null>(null)

  const selectedPerformance =
    edition.performances.find((p) => p.id === selectedPerformanceId) ?? edition.performances[0]
  const setlist = useMemo(
    () => setlistFor(setlists, selectedPerformanceId),
    [setlists, selectedPerformanceId],
  )

  const period = editionPeriod(edition)
  const titleImage = titleImageOf(edition.year)
  const trackCount = setlist === undefined ? 0 : performedTracks(setlist).length

  return (
    <section className="relative min-h-full">
      <div className="relative mx-auto w-full max-w-3xl px-4 pt-6 pb-24">
        <header className="mb-5">
          {/* dataset/<年>/title.* があれば中央にタイトル画像を出す */}
          {titleImage !== undefined ? (
            <img
              src={titleImage}
              alt={localize(edition.name, locale)}
              className="mx-auto mb-5 block max-h-40 w-auto max-w-full"
            />
          ) : null}

          {/* 画像がある年は見出しを読み上げ専用にして、同じ文字の重複を避ける */}
          <h2
            className={
              titleImage !== undefined ? 'sr-only' : 'text-2xl leading-snug font-black sm:text-3xl'
            }
          >
            {localize(edition.name, locale)}
          </h2>
          {edition.officialUrl !== undefined ? (
            <Tooltip>
              {/*
                トリガー自体をアンカーとして描画する。既定の div でラップすると
                role="button" の中にリンクが入れ子になり、ホバーも拾えなくなる。
              */}
              <Tooltip.Trigger<'a'>
                render={(triggerProps) => (
                  <a
                    {...triggerProps}
                    role={undefined}
                    href={edition.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={t('edition.officialSite')}
                    className="surface-card mt-2 inline-grid size-9 place-items-center rounded-lg transition hover:-translate-y-0.5 hover:shadow-md"
                  />
                )}
              >
                <LuGlobe aria-hidden />
              </Tooltip.Trigger>
              <Tooltip.Content>{t('edition.officialSite')}</Tooltip.Content>
            </Tooltip>
          ) : null}

          {period !== null ? (
            <p className="text-muted mt-1 text-sm tabular-nums">
              {formatters.full.format(parseEventDate(period.from))}
              {period.from !== period.to
                ? ` – ${formatters.full.format(parseEventDate(period.to))}`
                : ''}
            </p>
          ) : null}
        </header>

        {/* カード自体が公演地・会場・日程を書いているので、見出しは置かない */}
        {selectedPerformance !== undefined ? (
          <div className="mb-6">
            <PerformanceRail
              performances={edition.performances}
              selectedId={selectedPerformance.id}
              onSelect={setSelectedPerformanceId}
              onShowDetail={setDetailPerformance}
            />
          </div>
        ) : null}

        {setlist === undefined ? (
          <p className="surface-card text-muted rounded-xl p-6 text-center text-sm">
            {t('edition.noSetlist')}
          </p>
        ) : (
          <div className="surface-card rounded-2xl p-3 sm:p-5">
            <p className="text-muted mb-2 px-2 text-xs font-semibold">
              {t('edition.trackCount', { count: trackCount })}
            </p>
            <SetlistTimeline
              setlist={setlist}
              edition={edition}
              focusSong={focusSong}
              onSelectSong={onSelectSong}
              onFocusHandled={onFocusHandled}
            />
          </div>
        )}
      </div>

      <PerformanceDialog
        performance={detailPerformance}
        onClose={() => setDetailPerformance(null)}
      />
    </section>
  )
}
