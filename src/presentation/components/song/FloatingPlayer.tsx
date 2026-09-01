import { useEffect, useState } from 'react'
import { LuMaximize2, LuX } from 'react-icons/lu'
import type { Song } from '@/domain/song/Song'
import { youtubeEmbedUrl } from '@/domain/song/musicServiceUrl'
import { listenToPlayerStatus } from '@/infrastructure/youtube/embedPlayer'
import { useFloatingPlayerBox } from '@/presentation/components/song/useFloatingPlayerBox'
import { useLocale } from '@/presentation/providers/LocaleProvider'
import { usePlayer } from '@/presentation/providers/PlayerProvider'

/** 右下に縮んでいるときだけ出す帯。曲名と、広げる・閉じるの操作を載せる。 */
function MiniBar({
  song,
  onExpand,
  onClose,
}: {
  song: Song
  onExpand: () => void
  onClose: () => void
}) {
  const { t } = useLocale()

  return (
    <div className="flex h-7 shrink-0 items-center gap-1 pl-2.5 text-white">
      <span className="min-w-0 flex-1 truncate text-[11px] font-medium">{song.title}</span>
      <button
        type="button"
        onClick={onExpand}
        aria-label={t('a11y.expandPlayer', { title: song.title })}
        className="grid size-7 place-items-center text-white/70 transition hover:text-white"
      >
        <LuMaximize2 className="text-xs" />
      </button>
      <button
        type="button"
        onClick={onClose}
        aria-label={t('a11y.closePlayer')}
        className="grid size-7 place-items-center text-white/70 transition hover:text-white"
      >
        <LuX className="text-sm" />
      </button>
    </div>
  )
}

/**
 * 疑似的なピクチャーインピクチャー。
 *
 * 動画の iframe はこのコンポーネントだけが持ち、位置を付け替えて使い回す。
 * 曲の詳細が場所を貸している間はそこにぴたりと重ね、詳細が閉じたら右下へ滑らせる。
 * DOM 上の親は変えないので、移動しても再生は途切れない。
 */
export function FloatingPlayer({ onExpand }: { onExpand: (song: Song) => void }) {
  const { song, slot, stop } = usePlayer()
  // iframe は曲が変わると差し替わる。購読を張り直せるよう state で持つ。
  const [frame, setFrame] = useState<HTMLIFrameElement | null>(null)

  const videoId = song?.links.youtube
  const boxRef = useFloatingPlayerBox(slot, videoId)

  // 最後まで再生されたら、右下に置きっぱなしにせず自分から消える。
  useEffect(() => {
    if (frame === null) return
    return listenToPlayerStatus(frame, (status) => {
      if (status === 'ended') stop()
    })
  }, [frame, stop])

  if (song === null || videoId === undefined) return null

  const docked = slot !== null

  return (
    <div
      ref={boxRef}
      className={`fixed z-60 flex flex-col overflow-hidden rounded-xl ${
        docked ? '' : 'bg-slate-900 shadow-2xl ring-1 ring-black/10'
      }`}
    >
      {docked ? null : <MiniBar song={song} onExpand={() => onExpand(song)} onClose={stop} />}
      <iframe
        // 曲が変わったら新しい iframe にする。src の差し替えは戻る操作の履歴を汚す。
        key={videoId}
        ref={setFrame}
        id="floating-youtube-player"
        className="min-h-0 w-full flex-1"
        src={youtubeEmbedUrl(videoId)}
        title={song.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
