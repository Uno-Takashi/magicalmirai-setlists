/** 曲順の枠につく属性。 */

export const TRACK_TAGS = [
  'encore',
  'theme-song',
  'grand-prix',
  'band-intro',
  'bonus-track',
] as const
export type TrackTag = (typeof TRACK_TAGS)[number]

export function isTrackTag(value: string): value is TrackTag {
  return (TRACK_TAGS as readonly string[]).includes(value)
}

/** 公演で実際に演奏された枠か。ボーナストラックは円盤収録のみ。 */
export function isPerformed(tags: readonly TrackTag[]): boolean {
  return !tags.includes('bonus-track')
}
