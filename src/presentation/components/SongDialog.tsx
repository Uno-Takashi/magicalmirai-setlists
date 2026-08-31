import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { LuExternalLink, LuPlay, LuX } from 'react-icons/lu'
import { SiApplemusic, SiSpotify, SiYoutube } from 'react-icons/si'
import { editionsOfSong, singersOfSong } from '@/application/searchSongs'
import { producerLabel, type Song } from '@/domain/song/Song'
import {
  canEmbed,
  musicServiceLink,
  youtubeEmbedUrl,
  youtubeThumbnailUrl,
  type MusicServiceKind,
} from '@/domain/song/musicServiceUrl'
import { VocaloidChips } from '@/presentation/components/VocaloidChips'
import { useOverlay } from '@/presentation/hooks/useOverlay'
import { useCatalog } from '@/presentation/providers/CatalogProvider'
import { useLocale } from '@/presentation/providers/LocaleProvider'

const SERVICE_ICON = {
  youtube: SiYoutube,
  spotify: SiSpotify,
  appleMusic: SiApplemusic,
} as const

const SERVICE_LABEL = {
  youtube: { exact: 'song.playOnYoutube', search: 'song.searchOnYoutube' },
  spotify: { exact: 'song.openSpotify', search: 'song.searchSpotify' },
  appleMusic: { exact: 'song.openAppleMusic', search: 'song.searchAppleMusic' },
} as const

function ServiceLink({ song, kind }: { song: Song; kind: MusicServiceKind }) {
  const { t } = useLocale()
  const link = musicServiceLink(song, kind)
  const Icon = SERVICE_ICON[kind]
  const label = t(SERVICE_LABEL[kind][link.exact ? 'exact' : 'search'])

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noreferrer"
      className="surface-card flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <Icon aria-hidden className="shrink-0" />
      <span className="flex-1">{label}</span>
      <LuExternalLink aria-hidden className="text-muted shrink-0 text-xs" />
    </a>
  )
}

/** YouTube はクリックされるまで iframe を作らない (初期表示を軽く保つため)。 */
function YoutubePreview({ song }: { song: Song }) {
  const { t } = useLocale()
  const [playing, setPlaying] = useState(false)
  const videoId = song.links.youtube

  if (videoId === undefined) {
    return (
      <div className="surface-card text-muted flex aspect-video items-center justify-center rounded-xl text-sm">
        {t('song.noEmbed')}
      </div>
    )
  }

  if (!playing) {
    return (
      <button
        type="button"
        onClick={() => setPlaying(true)}
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

  return (
    <iframe
      className="aspect-video w-full rounded-xl"
      src={youtubeEmbedUrl(videoId)}
      title={song.title}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  )
}

/** その曲を歌ったボーカロイド。年ごとに違うことがあるので、全公演の和集合を出す。 */
function SongSingers({ song }: { song: Song }) {
  const { catalog, searchIndex } = useCatalog()
  return <VocaloidChips singers={singersOfSong(catalog, searchIndex, song.title)} />
}

/** その曲が演奏された開催回。年が並ぶだけで意味が通るので見出しは置かない。 */
function PerformedEditions({
  song,
  onSelectEdition,
}: {
  song: Song
  onSelectEdition: (slug: string) => void
}) {
  const { t } = useLocale()
  const { searchIndex } = useCatalog()
  const editions = editionsOfSong(searchIndex, song.title)
  if (editions.length === 0) return null

  return (
    <ul className="mt-1.5 flex flex-wrap gap-1">
      {editions.map((edition) => (
        <li key={edition.slug}>
          <button
            type="button"
            onClick={() => onSelectEdition(edition.slug)}
            aria-label={t('a11y.viewEdition', { year: edition.year })}
            className="bg-miku/15 text-miku hover:bg-miku/25 rounded px-1.5 py-0.5 text-[11px] font-semibold tabular-nums transition"
          >
            {edition.year}
          </button>
        </li>
      ))}
    </ul>
  )
}

export function SongDialog({
  song,
  onClose,
  onSelectEdition,
}: {
  song: Song | null
  onClose: () => void
  /** 年のバッジから、その年のセットリストへ移動する。 */
  onSelectEdition: (slug: string) => void
}) {
  const { t } = useLocale()
  useOverlay(song !== null, onClose)

  return (
    <AnimatePresence>
      {song !== null ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={song.title}
            className="surface-card w-full max-w-lg rounded-t-2xl p-5 shadow-2xl sm:rounded-2xl"
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg leading-tight font-bold break-words">{song.title}</h2>
                {song.producers.length > 0 ? (
                  <p className="text-muted mt-0.5 text-sm">{producerLabel(song)}</p>
                ) : null}
                <PerformedEditions song={song} onSelectEdition={onSelectEdition} />
                <div className="mt-2">
                  <SongSingers song={song} />
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={t('song.close')}
                className="text-muted shrink-0 rounded-lg p-1.5 transition hover:bg-black/5"
              >
                <LuX />
              </button>
            </div>

            {/* 曲が変わったら作り直して、再生状態を持ち越さない */}
            <YoutubePreview key={song.title} song={song} />

            <div className="mt-4 grid gap-2">
              {!canEmbed(song) ? <ServiceLink song={song} kind="youtube" /> : null}
              <ServiceLink song={song} kind="spotify" />
              <ServiceLink song={song} kind="appleMusic" />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
