import type { Meta, StoryObj } from '@storybook/react-vite'
import type { SongSearchHit } from '@/application/searchSongs'
import { fixtureCatalog, fixtureSong } from '@/fixtures/catalog'
import { SongSearchResult } from './SongSearchResult'

const editions = fixtureCatalog.entries.map((entry) => entry.edition)

function hit(title: string, appearedIn: readonly number[]): SongSearchHit {
  return { song: fixtureSong(title), editions: appearedIn.map((index) => editions[index]!) }
}

/**
 * 検索結果の 1 曲。
 *
 * 曲名を押すと詳細、年の札を押すとその年のセットリストへ移る。行き先が 2 つ
 * あるので、カード全体は押せるようにしていない。
 */
const meta = {
  title: 'Song/SongSearchResult',
  component: SongSearchResult,
  parameters: { layout: 'padded' },
  args: { onSelectSong: () => {}, onSelectEdition: () => {} },
} satisfies Meta<typeof SongSearchResult>

export default meta
type Story = StoryObj<typeof meta>

/** よくある形。作曲者と歌唱者、登場した年が並ぶ。 */
export const Default: Story = {
  args: { hit: hit('ネオンの通学路', [0, 1]) },
}

/** 多くの年で歌われた曲。年の札が折り返す。 */
export const ManyEditions: Story = {
  args: { hit: hit('とおいひかり', [0, 1, 2, 3]) },
}

/** 合作かつ複数人で歌う曲。札が 2 段になる。 */
export const Collaboration: Story = {
  args: { hit: hit('ダブル・ドライヴ', [1]) },
}

/** 長い曲名。切り詰めずに折り返し、お気に入りのボタンを押し出さないか見る。 */
export const LongTitle: Story = {
  args: { hit: hit('ながいながいタイトルの曲をここに置いて切り詰めを見る', [1]) },
}

/** 作曲者が不明な曲。作曲者の行を出さない。 */
export const UnknownProducer: Story = {
  args: { hit: hit('サンプル・アンセム', [1]) },
}

/** お気に入りの一覧から出すとき。ボタンが「外す」の見た目になる。 */
export const AsFavorite: Story = {
  args: { hit: hit('ネオンの通学路', [0, 1]), favoriteAppearance: 'remove' },
}
