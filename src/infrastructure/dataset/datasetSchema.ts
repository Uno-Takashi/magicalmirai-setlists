/**
 * dataset/ の YAML の構造を Zod で定義する。
 *
 * 役割は 2 つある。
 *
 * 1. **`rawTypes.ts` の型の出どころ。** 手書きの interface とスキーマを二重管理せず、
 *    ここから `z.infer` で型を導く。データ形式を変えるときはこのファイルだけ直す。
 * 2. **CI での検証。** すべて `strictObject` にしてあるので、キーのタイポや綴り違いは
 *    「黙って無視」ではなく検証エラーになる。実行は `dataset.node.test.ts`。
 *
 * **アプリの実行時には使わない。** dataset はビルド時に固定されるので、配信する
 * バンドルに Zod を載せる意味がない。zod は devDependency に置き、`rawTypes.ts` からは
 * `import type` でしか参照しない (型は消えるので Zod はバンドルに入らない)。
 *
 * 値の候補 (region / session / tags) はドメインの定数をそのまま使う。`toCatalog.ts` は
 * 未知の値を `other` に落としたり読み飛ばしたりするが、あれは表示を壊さないための
 * 最後の防波堤で、データの誤りはここで止める。
 */

import { z } from 'zod'
import { REGIONS } from '@/domain/edition/Region'
import { SESSIONS } from '@/domain/edition/Show'
import { TRACK_TAGS } from '@/domain/setlist/TrackTag'

/** 空文字や空白だけの値を弾く。YAML では書き忘れが空文字になりやすい。 */
const text = z.string().trim().min(1)

/** 16 進のカラーコード。ボーカロイドのテーマカラーなどに使う。 */
const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, '#RRGGBB の形で書く')

/** YouTube の動画 ID。URL を丸ごと貼る間違いを弾くため 11 文字に限る。 */
const youtubeVideoId = z.string().regex(/^[\w-]{11}$/, 'YouTube の動画 ID (11 文字) で書く')

/**
 * 公演回の id。`day<N>` または `day<N>-<昼夜>`。
 *
 * setlist.yaml 側は `performance` / `day` / `session` を組み立てて
 * この id を参照する (`toCatalog.ts` の `toShowRef`)。形が崩れると参照が
 * 静かに外れるので、ここで形を固定する。
 */
const showId = new RegExp(`^day\\d+(?:-(?:${SESSIONS.join('|')}))?$`)

/**
 * ロケール ID をキーにした表示文字列。`ja` は必須。
 *
 * 対応ロケールを列挙しているので、`zh-hant` のような綴り違いも弾ける。
 * ロケールを増やすときは i18n の `LOCALES` と揃えること
 * (`dataset.node.test.ts` がずれを検出する)。
 */
export const localizedTextSchema = z.strictObject({
  ja: text,
  en: text.optional(),
  'zh-Hant': text.optional(),
  ko: text.optional(),
})

// --- dataset/vocaloids.yaml ---

export const vocaloidSchema = z.strictObject({
  name: localizedTextSchema,
  color: hexColor,
})

export const vocaloidFileSchema = z.record(text, vocaloidSchema)

// --- dataset/songs.yaml ---

/** 曲名をキーにした楽曲マスタ。値が空 (null) の曲は「情報が無い」を表す。 */
export const songSchema = z.strictObject({
  producers: z.array(text).optional(),
  singers: z.array(text).optional(),
  youtube: youtubeVideoId.optional(),
  spotify: text.optional(),
  appleMusic: text.optional(),
})

export const songFileSchema = z.record(text, songSchema.nullable())

// --- dataset/<年>/edition.yaml ---

export const showSchema = z
  .strictObject({
    id: z.string().regex(showId, 'day<N> または day<N>-<昼夜> の形で書く'),
    date: z.iso.date(),
    label: text,
    session: z.enum(SESSIONS).optional(),
  })
  .refine(
    (show) => show.id.replace(/^day\d+/, '') === (show.session ? `-${show.session}` : ''),
    'id の昼夜と session が食い違っている',
  )

export const performanceSchema = z.strictObject({
  id: z.string().regex(/^[a-z0-9-]+$/, '英小文字・数字・ハイフンで書く'),
  region: z.enum(REGIONS),
  city: localizedTextSchema,
  venue: localizedTextSchema.optional(),
  halls: localizedTextSchema.optional(),
  mapQuery: text.optional(),
  shows: z.array(showSchema).min(1),
})

export const editionSchema = z.strictObject({
  year: z.int().min(2013),
  /** 識別子。10 周年のように西暦でない回があるので year とは別に持つ。 */
  slug: z.string().regex(/^[A-Za-z0-9-]+$/, '英数字とハイフンで書く'),
  name: localizedTextSchema,
  officialUrl: z.url().optional(),
  themeColors: z.array(hexColor).optional(),
  performances: z.array(performanceSchema).min(1),
})

// --- dataset/<年>/setlist.yaml ---

/**
 * 候補が演奏された公演回の指定。
 *
 * `performance` は edition.yaml の公演 id、`day` はその公演の何日目か、
 * `session` は昼夜。昼夜を分けていない年 (2020) は `session` を書かない。
 */
export const showRefSchema = z.strictObject({
  performance: text,
  day: z.int().positive(),
  session: z.enum(SESSIONS).optional(),
})

export const trackVariantSchema = z.strictObject({
  song: text,
  shows: z.array(showRefSchema).optional(),
  note: text.optional(),
  singers: z.array(text).optional(),
})

/**
 * 曲順の枠。固定曲は `song`、入れ替わる枠は `variants` で書く。
 *
 * 両方書いた枠は `toCatalog.ts` が `variants` だけを見て `song` を捨てるため、
 * 書いたつもりの曲が消える。どちらか一方だけを許す。
 */
export const trackSchema = z
  .strictObject({
    order: z.int().positive(),
    song: text.optional(),
    shows: z.array(showRefSchema).optional(),
    variants: z.array(trackVariantSchema).min(1).optional(),
    note: text.optional(),
    singers: z.array(text).optional(),
    tags: z.array(z.enum(TRACK_TAGS)).optional(),
  })
  .refine(
    (track) => (track.song === undefined) !== (track.variants === undefined),
    '枠は song か variants のどちらか一方だけを持つ',
  )

export const setSchema = z.strictObject({
  performances: z.array(text).min(1),
  tracks: z.array(trackSchema).min(1),
})

/** セットリスト未収集の年があるので sets は空でも null でもよい。 */
export const setlistFileSchema = z.strictObject({
  sets: z.array(setSchema).nullable(),
})
