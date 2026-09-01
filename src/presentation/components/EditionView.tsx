import { useState } from 'react'
import { performedTracks } from '@/domain/setlist/Setlist'
import type { EditionEntry } from '@/domain/catalog/Catalog'
import type { Performance } from '@/domain/edition/Performance'
import type { Song } from '@/domain/song/Song'
import { localize } from '@/domain/vocaloid/Vocaloid'
import { titleImageOf } from '@/infrastructure/dataset/titleImages'
import { EditionInfoPanel } from '@/presentation/components/EditionInfoPanel'
import { PerformanceDialog } from '@/presentation/components/PerformanceDialog'
import { SetlistSwitch } from '@/presentation/components/SetlistSwitch'
import { SetlistTimeline } from '@/presentation/components/SetlistTimeline'
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

  // 複数のセットリストを持つ年の、見ているセットリスト。この画面は開催回ごとに
  // 組み直される (EditionCarousel が slug を key にしている) ので、年をまたいで残らない。
  const [setlistIndex, setSetlistIndex] = useState(0)
  const setlist = setlists[setlistIndex]

  // 会場情報のモーダル。
  const [detailPerformance, setDetailPerformance] = useState<Performance | null>(null)

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
        </header>

        {/* 公式サイト・日程・会場は既定で畳んでおく */}
        <EditionInfoPanel edition={edition} onShowPerformance={setDetailPerformance} />

        {setlist === undefined ? (
          <p className="surface-card text-muted rounded-xl p-6 text-center text-sm">
            {t('edition.noSetlist')}
          </p>
        ) : (
          <div className="surface-card rounded-2xl p-3 sm:p-5">
            <SetlistSwitch
              setlists={setlists}
              edition={edition}
              selectedIndex={setlistIndex}
              onSelect={setSetlistIndex}
            />
            <p className="text-muted mb-2 px-2 text-xs font-semibold">
              {t('edition.trackCount', { count: trackCount })}
            </p>
            {/* 切り替えたら組み直して、曲が上から順に現れるアニメーションを流し直す */}
            <div key={setlistIndex}>
              <SetlistTimeline
                setlist={setlist}
                edition={edition}
                focusSong={focusSong}
                onSelectSong={onSelectSong}
                onFocusHandled={onFocusHandled}
              />
            </div>
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
