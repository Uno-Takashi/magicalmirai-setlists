import { useEffect, useEffectEvent, useRef } from 'react'
import type { Edition } from '@/domain/edition/Edition'
import { bonusTracks, performedTracks, type Setlist } from '@/domain/setlist/Setlist'
import type { Track } from '@/domain/setlist/Track'
import type { Song } from '@/domain/song/Song'
import { TrackRow } from '@/presentation/components/setlist/TrackRow'
import { useDialogs } from '@/presentation/providers/DialogsProvider'
import { useLocale } from '@/presentation/providers/LocaleProvider'
import { useNavigation } from '@/presentation/providers/NavigationProvider'

function TrackList({
  tracks,
  edition,
  onSelectSong,
  className,
}: {
  tracks: readonly Track[]
  edition: Edition
  onSelectSong: (song: Song) => void
  className?: string
}) {
  return (
    <ol className={`divide-[color:var(--surface-border)] divide-y ${className ?? ''}`}>
      {tracks.map((track, index) => (
        <TrackRow
          key={track.order}
          track={track}
          edition={edition}
          index={index}
          onSelect={onSelectSong}
        />
      ))}
    </ol>
  )
}

/**
 * セットリストの曲順。演奏された枠を並べ、円盤だけの曲は下にまとめる。
 *
 * 曲から年をたどって来たときは、その曲を画面の中央まで送る。
 */
export function SetlistTimeline({ setlist, edition }: { setlist: Setlist; edition: Edition }) {
  const { t } = useLocale()
  const { showSong } = useDialogs()
  const { entry, focusSong, clearFocusSong } = useNavigation()
  const containerRef = useRef<HTMLDivElement>(null)

  const bonus = bonusTracks(setlist)

  // 年送りのアニメーションの間は、送り出されていく前の年の画面もまだ生きている。
  // 同じ曲がそちらにもあると先に反応してしまうので、いま向かっている年の画面だけが応じる。
  const current = entry?.edition.slug === edition.slug

  // clearFocusSong は現在地が変わるたびに作り直されることがある。依存に入れると
  // 無関係な再描画でもスクロールが走ってしまうので、効果イベントに包んで
  // 「呼ぶときだけ最新の実装を見る」形にする。
  const focusRow = useEffectEvent((title: string) => {
    const row = containerRef.current?.querySelector(`[data-song="${CSS.escape(title)}"]`)
    row?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    clearFocusSong()
  })

  // 曲を指定して来たときは、その曲を中央に出す。
  useEffect(() => {
    if (current && focusSong != null) focusRow(focusSong)
  }, [current, focusSong])

  // 年を切り替えたら先頭へ戻す。
  //
  // focusSong はここでは依存にしない。指定された曲へスクロールした直後に
  // その指定を捨てるので、依存に入れるとその変化で再実行され、
  // 始まったばかりのスムーススクロールを先頭へ引き戻してしまう。
  const hasFocusSong = useEffectEvent(() => focusSong != null)
  useEffect(() => {
    if (!hasFocusSong()) window.scrollTo({ top: 0 })
  }, [edition.slug])

  return (
    <div ref={containerRef}>
      <TrackList tracks={performedTracks(setlist)} edition={edition} onSelectSong={showSong} />

      {bonus.length > 0 ? (
        <div className="mt-6">
          <h4 className="text-muted mb-1 px-2 text-xs font-semibold">{t('tag.bonus-track')}</h4>
          <TrackList
            tracks={bonus}
            edition={edition}
            onSelectSong={showSong}
            className="opacity-70"
          />
        </div>
      ) : null}
    </div>
  )
}
