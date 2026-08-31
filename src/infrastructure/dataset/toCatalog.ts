/** YAML から読んだ生データをドメインモデルへ変換する。 */

import type { Catalog, EditionEntry } from '@/domain/catalog/Catalog'
import type { Edition } from '@/domain/edition/Edition'
import type { Performance } from '@/domain/edition/Performance'
import { isRegion, type Region } from '@/domain/edition/Region'
import { SESSIONS, type Session, type Show } from '@/domain/edition/Show'
import type { Setlist } from '@/domain/setlist/Setlist'
import type { Track, TrackVariant } from '@/domain/setlist/Track'
import { isTrackTag, type TrackTag } from '@/domain/setlist/TrackTag'
import type { Song } from '@/domain/song/Song'
import type { Vocaloid } from '@/domain/vocaloid/Vocaloid'
import type {
  RawEdition,
  RawPerformance,
  RawSet,
  RawSetlistFile,
  RawShow,
  RawSongFile,
  RawTrack,
  RawVocaloidFile,
} from './rawTypes'

function toRegion(value: string): Region {
  return isRegion(value) ? value : 'other'
}

function toSession(value: string | undefined): Session | undefined {
  return value !== undefined && (SESSIONS as readonly string[]).includes(value)
    ? (value as Session)
    : undefined
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
    shows: raw.shows.map(toShow),
  }
}

export function toEdition(raw: RawEdition): Edition {
  return {
    year: raw.year,
    slug: raw.slug,
    name: raw.name,
    officialUrl: raw.officialUrl,
    themeColors: raw.themeColors ?? [],
    performances: raw.performances.map(toPerformance),
  }
}

function toTrack(raw: RawTrack): Track {
  const variants: TrackVariant[] =
    raw.variants?.map((variant) => ({
      song: variant.song,
      shows: variant.shows ?? [],
      note: variant.note,
      singers: variant.singers,
    })) ??
    (raw.song !== undefined
      ? [{ song: raw.song, shows: raw.shows ?? [], singers: raw.singers }]
      : [])

  return { order: raw.order, variants, tags: toTags(raw.tags) }
}

function toSetlist(raw: RawSet): Setlist {
  return { performanceIds: raw.performances, tracks: raw.tracks.map(toTrack) }
}

export function toSetlists(raw: RawSetlistFile): Setlist[] {
  return (raw.sets ?? []).map(toSetlist)
}

export function toSongs(raw: RawSongFile): Map<string, Song> {
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

export function toVocaloids(raw: RawVocaloidFile): Map<string, Vocaloid> {
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
  const entries: EditionEntry[] = editions
    .map(({ edition, setlist }) => ({
      edition: toEdition(edition),
      setlists: toSetlists(setlist),
    }))
    .sort((a, b) => a.edition.year - b.edition.year)

  return { entries, songs: toSongs(songs), vocaloids: toVocaloids(vocaloids) }
}
