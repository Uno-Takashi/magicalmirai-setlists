import { SiApplemusic, SiSpotify, SiYoutube } from 'react-icons/si'
import type { Song } from '@/domain/song/Song'
import { musicServiceLink, type MusicServiceKind } from '@/domain/song/musicServiceUrl'
import { ExternalLink } from '@/presentation/components/ui/ExternalLink'
import { useLocale } from '@/presentation/providers/LocaleProvider'

const SERVICE_ICON = {
  youtube: SiYoutube,
  spotify: SiSpotify,
  appleMusic: SiApplemusic,
} as const

/** 曲を特定できたときと、検索に落とすときで文言を変える。 */
const SERVICE_LABEL = {
  youtube: { exact: 'song.playOnYoutube', search: 'song.searchOnYoutube' },
  spotify: { exact: 'song.openSpotify', search: 'song.searchSpotify' },
  appleMusic: { exact: 'song.openAppleMusic', search: 'song.searchAppleMusic' },
} as const

/** 並べる順。埋め込みのある YouTube を先頭に置く。 */
const SERVICES: readonly MusicServiceKind[] = ['youtube', 'spotify', 'appleMusic']

function ServiceLink({ song, kind }: { song: Song; kind: MusicServiceKind }) {
  const { t } = useLocale()
  const link = musicServiceLink(song, kind)
  const Icon = SERVICE_ICON[kind]

  return (
    <ExternalLink href={link.url} icon={<Icon aria-hidden className="shrink-0" />}>
      {t(SERVICE_LABEL[kind][link.exact ? 'exact' : 'search'])}
    </ExternalLink>
  )
}

/**
 * 各音楽サービスへの導線。
 *
 * 埋め込みがあっても YouTube の行は残す。3 サービスが常に同じ並びで出るほうが
 * 探しやすく、埋め込みの外で見たい場合の行き先にもなる。
 */
export function MusicServiceLinks({ song }: { song: Song }) {
  return (
    <div className="mt-4 grid gap-2">
      {SERVICES.map((kind) => (
        <ServiceLink key={kind} song={song} kind={kind} />
      ))}
    </div>
  )
}
