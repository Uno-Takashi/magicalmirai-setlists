/**
 * YAML から読んだ生データをドメインモデルへ変換する。
 *
 * 実行時には Zod の検証を通さないので (`datasetSchema.ts`)、未知の値はここで
 * 落とすか `other` に寄せる。表示を壊さないための最後の防波堤で、データの誤りは
 * CI の `pnpm test:dataset` が止める。
 */

import type { Catalog, EditionEntry } from '@/domain/catalog/Catalog'
import type { Edition } from '@/domain/edition/Edition'
import type { Performance } from '@/domain/edition/Performance'
import { isRegion, type Region } from '@/domain/edition/Region'
import { isSession, type Session, type Show } from '@/domain/edition/Show'
import type { Setlist } from '@/domain/setlist/Setlist'
import type { ShowRef, Track, TrackVariant } from '@/domain/setlist/Track'
import { isTrackTag, type TrackTag } from '@/domain/setlist/TrackTag'
import type { Song } from '@/domain/song/Song'
import type { Vocaloid } from '@/domain/vocaloid/Vocaloid'
import type {
  RawEdition,
  RawPerformance,
  RawSet,
  RawSetlistFile,
  RawShow,
  RawShowRef,
  RawSongFile,
  RawTrack,
  RawTrackVariant,
  RawVocaloidFile,
} from './rawTypes'

function toRegion(value: string): Region {
  return isRegion(value) ? value : 'other'
}

function toSession(value: string | undefined): Session | undefined {
  return value !== undefined && isSession(value) ? value : undefined
}

function toTags(values: string[] | undefined): TrackTag[] {
  return (values ?? []).filter(isTrackTag)
}

function toShow(raw: RawShow): Show {
  return { id: raw.id, date: raw.date, label: raw.label, session: toSession(raw.session) }
}

function toPerformance(raw: RawPerformance): Performance {
  return {
    id: raw.id,
    region: toRegion(raw.region),
    city: raw.city,
    venue: raw.venue,
    halls: raw.halls,
    mapQuery: raw.mapQuery,
    shows: raw.shows.map(toShow),
  }
}

function toEdition(raw: RawEdition): Edition {
  return {
    year: raw.year,
    slug: raw.slug,
    name: raw.name,
    officialUrl: raw.officialUrl,
    themeColors: raw.themeColors ?? [],
    performances: raw.performances.map(toPerformance),
  }
}

/**
 * 公演回の指定を、ドメインの参照 (`<公演 id>/<公演回 id>`) に直す。
 *
 * 公演回の id は edition.yaml で `day<N>` / `day<N>-<昼夜>` と付けている。
 * この組み立て方を知っているのはここだけで、ドメインには文字列の形しか渡らない。
 */
function toShowRef(raw: RawShowRef): ShowRef {
  const session = raw.session === undefined ? '' : `-${raw.session}`
  return `${raw.performance}/day${raw.day}${session}`
}

function toVariant(raw: RawTrackVariant): TrackVariant {
  return {
    song: raw.song,
    shows: raw.shows?.map(toShowRef) ?? [],
    note: raw.note,
    singers: raw.singers,
  }
}

/** 固定曲 (`song`) は、候補が 1 つだけの枠として入れ替わる枠と同じ形にそろえる。 */
function toTrack(raw: RawTrack): Track {
  const variants =
    raw.variants?.map(toVariant) ??
    (raw.song === undefined ? [] : [toVariant({ ...raw, song: raw.song })])

  return { order: raw.order, variants, tags: toTags(raw.tags) }
}

function toSetlist(raw: RawSet): Setlist {
  return { performanceIds: raw.performances, tracks: raw.tracks.map(toTrack) }
}

function toSetlists(raw: RawSetlistFile): Setlist[] {
  return (raw.sets ?? []).map(toSetlist)
}

function toSongs(raw: RawSongFile): Map<string, Song> {
  const songs = new Map<string, Song>()
  for (const [title, value] of Object.entries(raw)) {
    songs.set(title, {
      title,
      producers: value?.producers ?? [],
      singers: value?.singers ?? [],
      links: {
        youtube: value?.youtube || undefined,
        spotify: value?.spotify || undefined,
        appleMusic: value?.appleMusic || undefined,
      },
    })
  }
  return songs
}

function toVocaloids(raw: RawVocaloidFile): Map<string, Vocaloid> {
  const vocaloids = new Map<string, Vocaloid>()
  for (const [id, value] of Object.entries(raw)) {
    vocaloids.set(id, { id, name: value.name, color: value.color })
  }
  return vocaloids
}

export function toCatalog(
  editions: { edition: RawEdition; setlist: RawSetlistFile }[],
  songs: RawSongFile,
  vocaloids: RawVocaloidFile,
): Catalog {
  const entries = editions
    .map(({ edition, setlist }): EditionEntry => ({
      edition: toEdition(edition),
      setlists: toSetlists(setlist),
    }))
    .sort((a, b) => a.edition.year - b.edition.year)

  return { entries, songs: toSongs(songs), vocaloids: toVocaloids(vocaloids) }
}
