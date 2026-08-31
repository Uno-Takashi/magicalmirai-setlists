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

export interface RawTrackVariant {
  song: string
  /** `<公演 id>/<公演回 id>` の配列。 */
  shows?: string[]
  note?: string
  singers?: string[]
}

export interface RawTrack {
  order: number
  song?: string
  shows?: string[]
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
