/**
 * Storybook 用の作り物のカタログ。
 *
 * **ここに実在の曲・公演は入れない。** 曲名も作曲者も開催回もすべて架空で、
 * dataset を読まない。理由は 2 つある。
 *
 * - ストーリーが dataset の中身に縛られない。曲が増減しても、日替わりの条件が
 *   変わっても、ストーリーの意図 (「日替わりの枠はこう出る」) は動かない。
 * - 見せたい形を直接作れる。実データから条件に合う枠を探し回らずに済み、
 *   長い曲名やカンマを含む曲名のような、崩れやすい形も意図して置ける。
 *
 * ボーカロイドの 6 人だけは実在のまま。テーマカラーが UI の見た目そのものなので、
 * 架空の色に置き換えると確認の役に立たなくなる。
 */

import type { Catalog, EditionEntry } from '@/domain/catalog/Catalog'
import type { Edition } from '@/domain/edition/Edition'
import type { Performance } from '@/domain/edition/Performance'
import type { Show } from '@/domain/edition/Show'
import type { Setlist } from '@/domain/setlist/Setlist'
import type { Track, TrackVariant } from '@/domain/setlist/Track'
import type { Song } from '@/domain/song/Song'
import type { Vocaloid, VocaloidId } from '@/domain/vocaloid/Vocaloid'

export const fixtureVocaloids: readonly Vocaloid[] = [
  { id: 'miku', name: { ja: '初音ミク', en: 'Hatsune Miku' }, color: '#39C5BB' },
  { id: 'rin', name: { ja: '鏡音リン', en: 'Kagamine Rin' }, color: '#FFCC11' },
  { id: 'len', name: { ja: '鏡音レン', en: 'Kagamine Len' }, color: '#FFEE11' },
  { id: 'luka', name: { ja: '巡音ルカ', en: 'Megurine Luka' }, color: '#FFBACC' },
  { id: 'meiko', name: { ja: 'MEIKO', en: 'MEIKO' }, color: '#DD4444' },
  { id: 'kaito', name: { ja: 'KAITO', en: 'KAITO' }, color: '#3366CC' },
]

/**
 * 架空の楽曲。曲名は実在しないものだけを使う。
 *
 * 崩れやすい形を意図して混ぜてある。
 * - `ながいながいタイトルの〜`: 切り詰めの確認用
 * - `Hello, Fixture`: カンマ入り (CSV の囲みの確認用)
 * - `ダブル・ドライヴ`: 合作 (作曲者が 2 人)
 */
const SONGS: readonly Song[] = [
  {
    title: 'ネオンの通学路',
    producers: ['サンプルP'],
    singers: ['miku'],
    links: { youtube: 'fixture0001' },
  },
  { title: 'くらげディスコ', producers: ['テストP'], singers: ['rin'], links: {} },
  { title: 'ゼロ番目の海', producers: ['ダミーP'], singers: ['luka'], links: {} },
  {
    title: 'ダブル・ドライヴ',
    producers: ['サンプルP', 'モックP'],
    singers: ['rin', 'len'],
    links: {},
  },
  { title: 'Hello, Fixture', producers: ['モックP'], singers: ['meiko'], links: {} },
  { title: 'サイダーロジック', producers: ['ダミーP'], singers: ['kaito'], links: {} },
  {
    title: 'ながいながいタイトルの曲をここに置いて切り詰めを見る',
    producers: ['とてもながい名前のプロデューサー'],
    singers: ['miku'],
    links: {},
  },
  { title: '未明のスケッチ', producers: ['テストP'], singers: ['miku'], links: {} },
  { title: 'リプレイ・パレヱド', producers: ['サンプルP'], singers: ['miku', 'rin'], links: {} },
  { title: 'とおいひかり', producers: ['モックP'], singers: ['miku'], links: {} },
  { title: 'サンプル・アンセム', producers: ['サンプルP'], singers: [], links: {} },
  {
    title: 'みんなでうたう歌',
    producers: ['テストP'],
    singers: ['miku', 'rin', 'len', 'luka', 'meiko', 'kaito'],
    links: {},
  },
  { title: 'まぼろしのボーナス曲', producers: ['ダミーP'], singers: ['miku'], links: {} },
]

function show(id: string, date: string, label: string, session?: Show['session']): Show {
  return session === undefined ? { id, date, label } : { id, date, label, session }
}

/** 昼夜のある 3 日間の公演。 */
function threeDays(prefix: string): Show[] {
  return [1, 2, 3]
    .flatMap((day) => [
      show(`day${day}-matinee`, `2091-08-0${day}`, `Day.${day} 昼`, 'matinee'),
      show(`day${day}-evening`, `2091-08-0${day}`, `Day.${day} 夜`, 'evening'),
    ])
    .map((s) => ({ ...s, id: `${s.id}`, date: s.date.replace('2091', prefix) }))
}

const TOKYO: Performance = {
  id: 'tokyo',
  region: 'tokyo',
  city: { ja: 'サンプル東京', en: 'Sample Tokyo' },
  venue: { ja: '架空メッセ', en: 'Fixture Messe' },
  halls: { ja: '1 号館・2 号館', en: 'Halls 1 and 2' },
  shows: threeDays('2091'),
}

const OSAKA: Performance = {
  id: 'osaka',
  region: 'osaka',
  city: { ja: 'サンプル大阪', en: 'Sample Osaka' },
  venue: { ja: 'ダミー国際展示場', en: 'Dummy Expo Hall' },
  shows: threeDays('2091').map((s) => ({ ...s, date: s.date.replace('-08-', '-07-') })),
}

/** 開催年をまたぐ地方公演。日程が 2 日だけで、他より短い。 */
const SAPPORO: Performance = {
  id: 'sapporo',
  region: 'other',
  city: { ja: 'サンプル札幌', en: 'Sample Sapporo' },
  venue: { ja: '架空文化ホール', en: 'Fixture Hall' },
  shows: [
    show('day1-matinee', '2092-02-01', 'Day.1 昼', 'matinee'),
    show('day1-evening', '2092-02-01', 'Day.1 夜', 'evening'),
    show('day2-matinee', '2092-02-02', 'Day.2 昼', 'matinee'),
  ],
}

/** 会場が未確定の公演。これから開催する回の見え方に使う。 */
const UNDECIDED: Performance = {
  id: 'hamamatsu',
  region: 'other',
  city: { ja: 'サンプル浜松', en: 'Sample Hamamatsu' },
  shows: [show('day1', '2093-08-01', 'Day.1')],
}

function track(order: number, variants: TrackVariant[], tags: Track['tags'] = []): Track {
  return { order, variants, tags }
}

function fixed(order: number, song: string, tags: Track['tags'] = []): Track {
  return track(order, [{ song, shows: [] }], tags)
}

/**
 * 入れ替わりの 4 通りが 1 つずつ入ったセットリスト。
 * どの枠がどの見え方になるかは `TrackVariation` が `shows` から決める。
 */
const MAIN_SETLIST: Setlist = {
  performanceIds: ['tokyo', 'osaka'],
  tracks: [
    fixed(1, 'ネオンの通学路'),
    // 会場替わり: 候補の分かれ方が会場の境目と一致する
    track(2, [
      { song: 'くらげディスコ', shows: ['tokyo/day1-matinee', 'tokyo/day1-evening'] },
      { song: 'ゼロ番目の海', shows: ['osaka/day1-matinee', 'osaka/day1-evening'] },
    ]),
    // 昼夜入れ替え: 昼と夜で丸ごと入れ替わる
    track(3, [
      { song: 'ダブル・ドライヴ', shows: ['tokyo/day1-matinee', 'osaka/day1-matinee'] },
      { song: 'Hello, Fixture', shows: ['tokyo/day1-evening', 'osaka/day1-evening'] },
    ]),
    // 日程替わり: 日の境目と一致し、会場では出し分けられていない
    track(4, [
      {
        song: 'サイダーロジック',
        shows: ['tokyo/day1-matinee', 'tokyo/day1-evening', 'osaka/day1-matinee'],
      },
      {
        song: 'ながいながいタイトルの曲をここに置いて切り詰めを見る',
        shows: ['tokyo/day2-matinee', 'osaka/day2-matinee'],
      },
    ]),
    fixed(5, '未明のスケッチ'),
    // 出典に条件しか書かれていない候補 (公演回をたどれない)
    track(6, [
      { song: 'リプレイ・パレヱド', shows: [], note: 'サンプル東京' },
      { song: 'とおいひかり', shows: [], note: 'サンプル大阪' },
    ]),
    fixed(7, 'サンプル・アンセム', ['band-intro']),
    fixed(8, 'みんなでうたう歌', ['grand-prix']),
    fixed(9, 'ネオンの通学路', ['encore']),
    fixed(10, 'とおいひかり', ['encore', 'theme-song']),
    fixed(11, 'まぼろしのボーナス曲', ['bonus-track']),
  ],
}

/** 地方公演だけの短いセットリスト。切り替えの確認用。 */
const SAPPORO_SETLIST: Setlist = {
  performanceIds: ['sapporo'],
  tracks: [
    fixed(1, 'くらげディスコ'),
    fixed(2, 'サイダーロジック'),
    fixed(3, 'みんなでうたう歌'),
    fixed(4, 'とおいひかり', ['encore', 'theme-song']),
  ],
}

function edition(
  year: number,
  slug: string,
  name: string,
  performances: readonly Performance[],
  officialUrl?: string,
): Edition {
  return {
    year,
    slug,
    name: { ja: name, en: `Fixture Mirai ${slug}` },
    officialUrl,
    themeColors: [],
    performances,
  }
}

/** 1 公演だけの回。初期の開催回にあたる。 */
export const fixtureSingleEntry: EditionEntry = {
  edition: edition(2090, '2090', 'サンプルミライ 2090', [
    { ...TOKYO, shows: threeDays('2090').slice(0, 2) },
  ]),
  setlists: [{ performanceIds: ['tokyo'], tracks: MAIN_SETLIST.tracks.slice(0, 5) }],
}

/** 2 公演の回。日替わりや昼夜入れ替えを一通り持つ。 */
export const fixtureMainEntry: EditionEntry = {
  edition: edition(
    2091,
    '2091',
    'サンプルミライ 2091',
    [TOKYO, OSAKA],
    'https://example.com/2091/',
  ),
  setlists: [MAIN_SETLIST],
}

/** 3 公演の回。開催年をまたぐ地方公演があり、セットリストを 2 つ持つ。 */
export const fixtureMultiSetlistEntry: EditionEntry = {
  edition: edition(2092, 'anniversary', 'サンプルミライ 記念公演', [TOKYO, OSAKA, SAPPORO]),
  setlists: [MAIN_SETLIST, SAPPORO_SETLIST],
}

/** これから開催する回。会場が未確定で、セットリストがまだ無い。 */
export const fixtureUpcomingEntry: EditionEntry = {
  edition: edition(2093, '2093', 'サンプルミライ 2093', [UNDECIDED]),
  setlists: [],
}

/** ストーリー全体で使うカタログ。`entries` は開催年の昇順。 */
export const fixtureCatalog: Catalog = {
  entries: [fixtureSingleEntry, fixtureMainEntry, fixtureMultiSetlistEntry, fixtureUpcomingEntry],
  songs: new Map(SONGS.map((song) => [song.title, song])),
  vocaloids: new Map(fixtureVocaloids.map((vocaloid) => [vocaloid.id, vocaloid])),
}

export function fixtureSong(title: string): Song {
  const song = fixtureCatalog.songs.get(title)
  if (song === undefined) throw new Error(`${title} は作り物のカタログにありません`)
  return song
}

export function fixturePerformance(id: string): Performance {
  const performance = fixtureMultiSetlistEntry.edition.performances.find((p) => p.id === id)
  if (performance === undefined) throw new Error(`${id} は作り物のカタログにありません`)
  return performance
}

export const fixtureVocaloidIds: readonly VocaloidId[] = fixtureVocaloids.map((v) => v.id)
