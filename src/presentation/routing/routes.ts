/**
 * サイトのページの形。URL の組み立てと読み取りの決まりだけを持つ。
 *
 *   <base>statics             統計ページ
 *   <base>statics/<ranking>   全体ランキングのページ
 *   <base><slug>              その開催回のページ
 *   <base>                    既定の開催回
 *
 * 画面 (`useRoute`) とビルド時の書き出し (`build/pageMeta.ts`) の両方が使う。
 * ビルド側は Node で読むので、**このファイルは何も import しない**
 * (`import.meta.env` も読まない。base を知っているのは `useRoute` の側)。
 */

/**
 * 統計ページのパス。綴りは statistics ではないが、公開済みの URL なので変えない。
 */
export const STATISTICS_PATH = 'statics'

/** 統計ページの中の、全体ランキングのページ。 */
export const RANKINGS = ['producers', 'songs', 'vocaloids'] as const
export type RankingKind = (typeof RANKINGS)[number]

/**
 * 全体ランキングの各ページの見出し (翻訳キー)。画面の見出しと meta の title に使う。
 *
 * 型で翻訳キーに縛れないのは、このファイルが何も import しないため。
 * 使う側 (`t()` / `ja[...]`) が翻訳キーしか受け取らないので、綴りを誤れば型で落ちる。
 */
export const RANKING_TITLE_KEYS = {
  producers: 'statistics.producers.title',
  songs: 'statistics.songs.title',
  vocaloids: 'statistics.vocaloids.title',
} as const satisfies Record<RankingKind, string>

export function rankingPath(kind: RankingKind): string {
  return `${STATISTICS_PATH}/${kind}`
}

export type Route =
  | { readonly kind: 'edition'; readonly slug: string }
  | { readonly kind: 'statistics' }
  | { readonly kind: 'ranking'; readonly ranking: RankingKind }

function isRanking(value: string): value is RankingKind {
  return (RANKINGS as readonly string[]).includes(value)
}

/**
 * base を取り除いたパス (先頭・末尾のスラッシュなし) を現在地に直す。
 *
 * 空のパス (ホーム) は既定の開催回を指す。統計の下の知らないページは
 * 統計ページに寄せる。
 */
export function parseRoute(path: string, fallbackSlug: string): Route {
  if (path === '') return { kind: 'edition', slug: fallbackSlug }

  const [head, tail] = path.split('/')
  if (head === STATISTICS_PATH) {
    return tail !== undefined && isRanking(tail)
      ? { kind: 'ranking', ranking: tail }
      : { kind: 'statistics' }
  }
  return { kind: 'edition', slug: path }
}
