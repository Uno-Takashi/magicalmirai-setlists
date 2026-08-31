import type { Meta, StoryObj } from '@storybook/react-vite'
import { loadCatalog } from '@/infrastructure/dataset/loadCatalog'
import { SongDialog } from './SongDialog'

const catalog = loadCatalog()

function song(title: string) {
  const found = catalog.songs.get(title)
  if (found === undefined) throw new Error(`${title} が dataset/songs.yaml にありません`)
  return found
}

const meta = {
  title: 'Song/SongDialog',
  component: SongDialog,
  parameters: { layout: 'fullscreen' },
  args: { onClose: () => {}, onSelectEdition: () => {} },
} satisfies Meta<typeof SongDialog>

export default meta
type Story = StoryObj<typeof meta>

/** YouTube の動画 ID が登録されている曲。サムネイルを押すと iframe に差し替わる。 */
export const WithYoutubeEmbed: Story = {
  args: { song: song('カルチャ') },
}

/** 動画未登録の曲。埋め込みの代わりに各サービスの検索リンクを出す。 */
export const WithoutYoutubeEmbed: Story = {
  args: { song: song('ブリキノダンス') },
}

/** 6 人全員が歌う曲。 */
export const AllVocaloids: Story = {
  args: { song: song('Blessing') },
}

export const Closed: Story = {
  args: { song: null },
}
