/** dataset/ の YAML をそのまま写した型。ドメインの型とは意図的に分けている。 */

export interface RawLocalizedText {
  ja: string
  [locale: string]: string | undefined
}

export interface RawVocaloid {
  name: RawLocalizedText
  color: string
}

export type RawVocaloidFile = Record<string, RawVocaloid>

export interface RawSong {
  producers?: string[]
  singers?: string[]
  youtube?: string
  spotify?: string
  appleMusic?: string
}

export type RawSongFile = Record<string, RawSong | null>

export interface RawShow {
  id: string
  date: string
  label: string
  session?: string
}

export interface RawPerformance {
  id: string
  region: string
  city: RawLocalizedText
  venue?: RawLocalizedText
  halls?: RawLocalizedText
  mapQuery?: string
  shows: RawShow[]
}

export interface RawEdition {
  year: number
  slug: string
  name: RawLocalizedText
  officialUrl?: string
  themeColors?: string[]
  performances: RawPerformance[]
}

/**
 * 候補が演奏された公演回の指定。
 *
 * `performance` は edition.yaml の公演 id、`day` はその公演の何日目か、
 * `session` は昼夜。昼夜を分けていない年 (2020) は `session` を書かない。
 */
export interface RawShowRef {
  performance: string
  day: number
  session?: string
}

export interface RawTrackVariant {
  song: string
  shows?: RawShowRef[]
  note?: string
  singers?: string[]
}

export interface RawTrack {
  order: number
  song?: string
  shows?: RawShowRef[]
  variants?: RawTrackVariant[]
  singers?: string[]
  tags?: string[]
}

export interface RawSet {
  performances: string[]
  tracks: RawTrack[]
}

export interface RawSetlistFile {
  sets: RawSet[] | null
}
