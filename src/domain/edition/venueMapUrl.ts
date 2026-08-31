/**
 * 会場の地図への導線を決めるポリシー。
 *
 * 地図そのものは持たず、会場名を Google マップの検索語として渡すだけにしている。
 * 会場は年ごとに増えるので、緯度経度を dataset に書かせると追加のたびに
 * 調べ直す作業が増える。会場名なら edition.yaml に元から書いてある。
 */

import type { Performance } from './Performance'

/**
 * 検索語は常に日本語の会場名を使う。国内の会場なので、英語名や中国語名より
 * 日本語表記のほうが確実に 1 か所へ定まる。会場名だけで引けない場所は
 * dataset の mapQuery で上書きする。
 */
function mapQuery(performance: Performance): string | undefined {
  if (performance.mapQuery !== undefined) return performance.mapQuery
  return performance.venue?.ja
}

/**
 * 地図の縮尺。建物が画面いっぱいになる寄り (16 以上) だと、そこがどの街のどのあたりか
 * が読めない。最寄り駅や幹線道路が一緒に入る程度に引いておく。
 */
const ZOOM = 14

/**
 * 埋め込み地図の URL。会場が未確定の年は undefined を返し、UI は地図を出さない。
 *
 * Google マップ本体へ飛ぶ URL は持たない。埋め込み地図自身が「大きな地図で見る」を
 * 出すので、同じ行き先のリンクをこちらで重ねても増えるのは押す場所だけになる。
 */
export function venueMapEmbedUrl(performance: Performance, locale: string): string | undefined {
  const query = mapQuery(performance)
  if (query === undefined) return undefined
  const params = new URLSearchParams({ q: query, hl: locale, z: String(ZOOM), output: 'embed' })
  return `https://maps.google.com/maps?${params.toString()}`
}
