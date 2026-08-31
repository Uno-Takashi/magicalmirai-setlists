/**
 * 各音楽サービスへの導線を決めるポリシー。
 *
 * データセットに正確な URL があればそれを使い、無ければ検索 URL を組み立てる。
 * 存在しないリンクを表示しないための、ドメイン側の意思決定として置いている。
 */

import { producerLabel, type Song } from './Song'

export type MusicServiceKind = 'youtube' | 'spotify' | 'appleMusic'

export interface MusicServiceLink {
  readonly kind: MusicServiceKind
  readonly url: string
  /** true なら正確なリンク、false なら検索へのフォールバック。 */
  readonly exact: boolean
}

function query(song: Song): string {
  return encodeURIComponent(`${song.title} ${producerLabel(song)}`.trim())
}

export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
}

export function youtubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
}

export function musicServiceLink(song: Song, kind: MusicServiceKind): MusicServiceLink {
  switch (kind) {
    case 'youtube':
      return song.links.youtube
        ? { kind, url: `https://www.youtube.com/watch?v=${song.links.youtube}`, exact: true }
        : { kind, url: `https://www.youtube.com/results?search_query=${query(song)}`, exact: false }
    case 'spotify':
      return song.links.spotify
        ? { kind, url: song.links.spotify, exact: true }
        : { kind, url: `https://open.spotify.com/search/${query(song)}`, exact: false }
    case 'appleMusic':
      return song.links.appleMusic
        ? { kind, url: song.links.appleMusic, exact: true }
        : { kind, url: `https://music.apple.com/jp/search?term=${query(song)}`, exact: false }
  }
}

/** 埋め込み再生できるか。できない曲は検索リンクだけを出す。 */
export function canEmbed(song: Song): boolean {
  return Boolean(song.links.youtube)
}
