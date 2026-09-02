/**
 * dataset/ の YAML をそのまま写した型。ドメインの型とは意図的に分けている。
 *
 * 定義の実体は `datasetSchema.ts` の Zod スキーマで、ここはそこから型を導くだけ。
 * 手書きの interface と検証を二重管理すると、片方だけ直してもう片方が古びる
 * (実際に `note` が型に無く、書いても黙って捨てられていた)。
 *
 * `import type` でしか触らないので、Zod は配信するバンドルには入らない。
 */

import type { z } from 'zod'
import type {
  editionSchema,
  localizedTextSchema,
  performanceSchema,
  setlistFileSchema,
  setSchema,
  showRefSchema,
  showSchema,
  songFileSchema,
  songSchema,
  trackSchema,
  trackVariantSchema,
  vocaloidFileSchema,
  vocaloidSchema,
} from './datasetSchema'

export type RawLocalizedText = z.infer<typeof localizedTextSchema>

export type RawVocaloid = z.infer<typeof vocaloidSchema>
export type RawVocaloidFile = z.infer<typeof vocaloidFileSchema>

export type RawSong = z.infer<typeof songSchema>
export type RawSongFile = z.infer<typeof songFileSchema>

export type RawShow = z.infer<typeof showSchema>
export type RawPerformance = z.infer<typeof performanceSchema>
export type RawEdition = z.infer<typeof editionSchema>

export type RawShowRef = z.infer<typeof showRefSchema>
export type RawTrackVariant = z.infer<typeof trackVariantSchema>
export type RawTrack = z.infer<typeof trackSchema>
export type RawSet = z.infer<typeof setSchema>
export type RawSetlistFile = z.infer<typeof setlistFileSchema>
