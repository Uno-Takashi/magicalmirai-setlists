import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { LuMaximize2, LuX } from 'react-icons/lu'
import type { Song } from '@/domain/song/Song'
import { youtubeEmbedUrl } from '@/domain/song/musicServiceUrl'
import { listenToPlayerStatus } from '@/infrastructure/youtube/embedPlayer'
import { useLocale } from '@/presentation/providers/LocaleProvider'
import { usePlayer } from '@/presentation/providers/PlayerProvider'

/** 右下に出すときの寸法 (px)。幅は画面が狭ければ縮める。 */
const MINI_WIDTH = 320
const MINI_MARGIN = 16
/** 曲名と操作ボタンを載せる帯の高さ。右下のときだけ足す。 */
const MINI_BAR = 28

interface Rect {
  readonly left: number
  readonly top: number
  readonly width: number
  readonly height: number
}

function miniRect(): Rect {
  const width = Math.min(MINI_WIDTH, window.innerWidth - MINI_MARGIN * 2)
  const height = Math.round((width * 9) / 16) + MINI_BAR
  return {
    left: window.innerWidth - MINI_MARGIN - width,
    top: window.innerHeight - MINI_MARGIN - height,
    width,
    height,
  }
}

function place(box: HTMLElement, rect: Rect): void {
  box.style.left = `${rect.left}px`
  box.style.top = `${rect.top}px`
  box.style.width = `${rect.width}px`
  box.style.height = `${rect.height}px`
}

const SLIDE = ['left', 'top', 'width', 'height']
  .map((property) => `${property} 320ms cubic-bezier(0.22, 1, 0.36, 1)`)
  .join(', ')

/**
 * 疑似的なピクチャーインピクチャー。
 *
 * 動画の iframe はこのコンポーネントだけが持ち、位置を付け替えて使い回す。
 * 曲の詳細が場所を貸している間はそこにぴたりと重ね、詳細が閉じたら右下へ滑らせる。
 * DOM 上の親は変えないので、移動しても再生は途切れない。
 */
export function FloatingPlayer({ onExpand }: { onExpand: (song: Song) => void }) {
  const { t } = useLocale()
  const { song, slot, stop } = usePlayer()
  const boxRef = useRef<HTMLDivElement>(null)
  // iframe は曲が変わると差し替わる。購読を張り直せるよう state で持つ。
  const [frame, setFrame] = useState<HTMLIFrameElement | null>(null)

  const videoId = song?.links.youtube
  const docked = slot !== null

  useLayoutEffect(() => {
    const box = boxRef.current
    if (box === null) return

    if (slot !== null) {
      // 貸してもらった場所へ毎フレーム重ねる。詳細が出入りするアニメーションにも追従する。
      box.style.transition = 'none'
      let frameId = 0
      const follow = () => {
        place(box, slot.getBoundingClientRect())
        frameId = requestAnimationFrame(follow)
      }
      follow()
      return () => cancelAnimationFrame(frameId)
    }

    // 場所が返ってきたら、いま居る位置から右下へ滑らせる。
    box.style.transition = SLIDE
    const toCorner = () => place(box, miniRect())
    toCorner()
    window.addEventListener('resize', toCorner)
    return () => window.removeEventListener('resize', toCorner)
  }, [slot, videoId])

  // 最後まで再生されたら、右下に置きっぱなしにせず自分から消える。
  useEffect(() => {
    if (frame === null) return
    return listenToPlayerStatus(frame, (status) => {
      if (status === 'ended') stop()
    })
  }, [frame, stop])

  const expand = useCallback(() => {
    if (song !== null) onExpand(song)
  }, [onExpand, song])

  if (song === null || videoId === undefined) return null

  return (
    <div
      ref={boxRef}
      className={`fixed z-60 flex flex-col overflow-hidden rounded-xl ${
        docked ? '' : 'bg-slate-900 shadow-2xl ring-1 ring-black/10'
      }`}
    >
      {docked ? null : (
        <div className="flex h-7 shrink-0 items-center gap-1 pl-2.5 text-white">
          <span className="min-w-0 flex-1 truncate text-[11px] font-medium">{song.title}</span>
          <button
            type="button"
            onClick={expand}
            aria-label={t('a11y.expandPlayer', { title: song.title })}
            className="grid size-7 place-items-center text-white/70 transition hover:text-white"
          >
            <LuMaximize2 className="text-xs" />
          </button>
          <button
            type="button"
            onClick={stop}
            aria-label={t('a11y.closePlayer')}
            className="grid size-7 place-items-center text-white/70 transition hover:text-white"
          >
            <LuX className="text-sm" />
          </button>
        </div>
      )}
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
