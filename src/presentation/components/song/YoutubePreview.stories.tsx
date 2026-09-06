import type { Meta, StoryObj } from '@storybook/react-vite'
import { fixtureSong } from '@/fixtures/catalog'
import { YoutubePreview } from './YoutubePreview'

/**
 * 曲の動画。押されるまで iframe を作らず、サムネイルだけを出す。
 *
 * **作り物の動画 ID なので、サムネイルは読み込めない。** 確かめるのは
 * 縦横比 (16:9) と再生ボタンの重なり、そして埋め込みが無いときの見え方。
 */
const meta = {
  title: 'Song/YoutubePreview',
  component: YoutubePreview,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof YoutubePreview>

export default meta
type Story = StoryObj<typeof meta>

/** 動画 ID がある曲。押すと右下のプレイヤーで再生が始まる。 */
export const Playable: Story = {
  args: { song: fixtureSong('ネオンの通学路') },
}

/** 動画 ID が無い曲。再生できない旨だけを出し、検索リンクは別の場所に置く。 */
export const NoEmbed: Story = {
  args: { song: fixtureSong('くらげディスコ') },
}
