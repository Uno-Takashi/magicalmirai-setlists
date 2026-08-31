import { useEffect, useEffectEvent, useRef } from 'react'
import type { Edition } from '@/domain/edition/Edition'
import { bonusTracks, performedTracks, type Setlist } from '@/domain/setlist/Setlist'
import type { Song } from '@/domain/song/Song'
import { TrackRow } from '@/presentation/components/TrackRow'
import { useLocale } from '@/presentation/providers/LocaleProvider'

export function SetlistTimeline({
  setlist,
  edition,
  focusSong,
  onSelectSong,
  onFocusHandled,
}: {
  setlist: Setlist
  edition: Edition
  /** 指定した曲を画面中央に出す。曲から年をたどって来たときに使う。 */
  focusSong?: string | null
  onSelectSong: (song: Song) => void
  onFocusHandled?: () => void
}) {
  const { t } = useLocale()
  const performed = performedTracks(setlist)
  const bonus = bonusTracks(setlist)
  const containerRef = useRef<HTMLDivElement>(null)

  // onFocusHandled は呼び出し側で毎回作り直されることがある。依存に入れると
  // モーダルを開いただけの再描画でもスクロールが走ってしまうので、
  // 効果イベントに包んで「呼ぶときだけ最新の実装を見る」形にする。
  const focusRow = useEffectEvent((title: string) => {
    const row = containerRef.current?.querySelector(`[data-song="${CSS.escape(title)}"]`)
    row?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    onFocusHandled?.()
  })

  // 曲を指定して来たときは、その曲を中央に出す。
  useEffect(() => {
    if (focusSong != null) focusRow(focusSong)
  }, [focusSong])

  // 年を切り替えたら先頭へ戻す。
  //
  // focusSong はここでは依存にしない。指定された曲へスクロールした直後に
  // 呼び出し側が focusSong を捨てるので、依存に入れるとその変化で再実行され、
  // 始まったばかりのスムーススクロールを先頭へ引き戻してしまう。
  const hasFocusSong = useEffectEvent(() => focusSong != null)
  useEffect(() => {
    if (!hasFocusSong()) window.scrollTo({ top: 0 })
  }, [edition.slug])

  return (
    <div ref={containerRef}>
      <ol className="divide-[color:var(--surface-border)] divide-y">
        {performed.map((track, index) => (
          <TrackRow
            key={track.order}
            track={track}
            edition={edition}
            index={index}
            onSelect={onSelectSong}
          />
        ))}
      </ol>

      {bonus.length > 0 ? (
        <div className="mt-6">
          <h4 className="text-muted mb-1 px-2 text-xs font-semibold">{t('tag.bonus-track')}</h4>
          <ol className="divide-[color:var(--surface-border)] divide-y opacity-70">
            {bonus.map((track, index) => (
              <TrackRow
                key={track.order}
                track={track}
                edition={edition}
                index={index}
                onSelect={onSelectSong}
              />
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  )
}
