import { useCallback } from 'react'
import { LuPlay } from 'react-icons/lu'
import type { Song } from '@/domain/song/Song'
import { youtubeThumbnailUrl } from '@/domain/song/musicServiceUrl'
import { useLocale } from '@/presentation/providers/LocaleProvider'
import { usePlayer } from '@/presentation/providers/PlayerProvider'

/**
 * YouTube はクリックされるまで iframe を作らない (初期表示を軽く保つため)。
 *
 * 再生を押すと、動画そのものは `FloatingPlayer` が持つ。ここはその置き場所を
 * 貸すだけなので、この詳細を閉じても再生は止まらず右下へ移る。
 */
export function YoutubePreview({ song }: { song: Song }) {
  const { t } = useLocale()
  const { song: playing, play, dock } = usePlayer()
  const videoId = song.links.youtube
  const onScreen = playing?.title === song.title
  const start = useCallback(() => play(song), [play, song])

  if (videoId === undefined) {
    return (
      <div className="surface-card text-muted flex aspect-video items-center justify-center rounded-xl text-sm">
        {t('song.noEmbed')}
      </div>
    )
  }

  // 再生中なら、動画が重なる場所を空けて貸す。中身は FloatingPlayer が描く。
  if (onScreen) return <div ref={dock} className="aspect-video w-full rounded-xl bg-black" />

  return (
    <button
      type="button"
      onClick={start}
      className="group relative aspect-video w-full overflow-hidden rounded-xl"
    >
      <img
        src={youtubeThumbnailUrl(videoId)}
        alt=""
        loading="lazy"
        className="size-full object-cover transition group-hover:scale-105"
      />
      <span className="absolute inset-0 grid place-items-center bg-black/35 transition group-hover:bg-black/20">
        <span className="grid size-14 place-items-center rounded-full bg-white/90 text-slate-900 shadow-lg transition group-hover:scale-110">
          <LuPlay className="ml-0.5 text-2xl" aria-hidden />
        </span>
      </span>
      <span className="sr-only">{t('song.playOnYoutube')}</span>
    </button>
  )
}
