/** 楽曲。dataset/songs.yaml に対応する。曲名を自然キーとして扱う。 */

import type { VocaloidId } from '@/domain/vocaloid/Vocaloid'

export type SongTitle = string

export interface Song {
  /** 曲名。全データセットを通じた一意キー。 */
  readonly title: SongTitle
  /**
   * 作曲者 (P名)。合作があるので配列で持つ。
   * 「kz(livetune)×八王子P」は 2 人としてこの配列に入る。不明なら空配列。
   */
  readonly producers: readonly string[]
  /** 原曲を歌唱するボーカロイド。不明なら空配列。 */
  readonly singers: readonly VocaloidId[]
  readonly links: SongLinks
}

export interface SongLinks {
  /** YouTube の動画 ID。未登録なら undefined。 */
  readonly youtube?: string
  readonly spotify?: string
  readonly appleMusic?: string
}

/** 合作を 1 行で見せるときの表記。 */
export function producerLabel(song: Song): string {
  return song.producers.join('×')
}

/** 曲名と作曲者を組にした検索用の文字列。 */
export function songSearchIndex(song: Song): string {
  return `${song.title} ${song.producers.join(' ')}`.toLowerCase()
}
