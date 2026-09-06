import type { Meta, StoryObj } from '@storybook/react-vite'
import { fixtureSong } from '@/fixtures/catalog'
import { MusicServiceLinks } from './MusicServiceLinks'

/**
 * 各音楽サービスへの導線。
 *
 * データセットに正確な URL があればそこへ、無ければ検索へ落とす
 * (`musicServiceUrl.ts` のポリシー)。文言もそれに合わせて変わるので、
 * 両方の見え方を並べて確かめる。
 */
const meta = {
  title: 'Song/MusicServiceLinks',
  component: MusicServiceLinks,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof MusicServiceLinks>

export default meta
type Story = StoryObj<typeof meta>

/** YouTube の動画 ID がある曲。YouTube だけが「再生」の文言になる。 */
export const WithYoutube: Story = {
  args: { song: fixtureSong('ネオンの通学路') },
}

/** リンクが 1 つも無い曲。3 つとも検索への導線になる。 */
export const SearchOnly: Story = {
  args: { song: fixtureSong('くらげディスコ') },
}

/** すべてのサービスに正確なリンクがある場合。 */
export const AllExact: Story = {
  args: {
    song: {
      ...fixtureSong('ゼロ番目の海'),
      links: {
        youtube: 'fixture0002',
        spotify: 'https://open.spotify.com/track/fixture',
        appleMusic: 'https://music.apple.com/jp/album/fixture',
      },
    },
  },
}
