import type { Meta, StoryObj } from '@storybook/react-vite'
import { SearchOverlay } from './SearchOverlay'

/**
 * 曲名の逐次検索。
 *
 * 検索インデックスは `CatalogProvider` が組み立て済みなので、1 文字ごとの
 * 再計算は配列走査だけで済む。ボーカロイドでの絞り込みも重ねられる。
 */
const meta = {
  title: 'Song/SearchOverlay',
  component: SearchOverlay,
  parameters: { layout: 'fullscreen' },
  args: {
    open: true,
    onClose: () => {},
    onSelectSong: () => {},
    onSelectEdition: () => {},
  },
} satisfies Meta<typeof SearchOverlay>

export default meta
type Story = StoryObj<typeof meta>

/** 開いた直後。まだ何も入力していないので、結果は出ない。 */
export const Empty: Story = {}

/** 曲名の一部で探した状態。 */
export const WithQuery: Story = {
  args: { initialQuery: 'ネオン' },
}

/**
 * 作曲者の名前で探した状態。
 * 統計のボカロ P の行から飛んで来ると、この形で開く。
 */
export const ByProducer: Story = {
  args: { initialQuery: 'サンプルP' },
}

/** 当たらない語。結果が空のときの見え方。 */
export const NoResults: Story = {
  args: { initialQuery: 'みつからないきょくめい' },
}

/** 閉じた状態。何も描画しない。 */
export const Closed: Story = {
  args: { open: false },
}
