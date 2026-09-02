import type { Meta, StoryObj } from '@storybook/react-vite'
import { fixtureSong } from '@/fixtures/catalog'
import { FloatingPlayer } from './FloatingPlayer'
import { SongDialog } from './SongDialog'

const meta = {
  title: 'Song/SongDialog',
  component: SongDialog,
  parameters: { layout: 'fullscreen' },
  args: { onClose: () => {}, onSelectEdition: () => {} },
  // 動画はアプリ本体と同じく詳細の外側で持つ。ここでも並べて置き場所の受け渡しを見る。
  decorators: [
    (Story) => (
      <>
        <Story />
        <FloatingPlayer onExpand={() => {}} />
      </>
    ),
  ],
} satisfies Meta<typeof SongDialog>

export default meta
type Story = StoryObj<typeof meta>

/**
 * 動画 ID が登録されている曲。サムネイルを押すと iframe に差し替わる。
 *
 * 作り物のカタログなので ID は実在しない。サムネイルと再生の中身は出ないが、
 * 置き場所の受け渡し (詳細 → 右下) はこの状態でも確かめられる。
 */
export const WithYoutubeEmbed: Story = {
  args: { song: fixtureSong('ネオンの通学路') },
}

/** 動画未登録の曲。埋め込みの代わりに各サービスの検索リンクを出す。 */
export const WithoutYoutubeEmbed: Story = {
  args: { song: fixtureSong('くらげディスコ') },
}

/** 6 人全員が歌う曲。 */
export const AllVocaloids: Story = {
  args: { song: fixtureSong('みんなでうたう歌') },
}

/** 合作の曲。作曲者が 2 人並ぶ。 */
export const Collaboration: Story = {
  args: { song: fixtureSong('ダブル・ドライヴ') },
}

export const Closed: Story = {
  args: { song: null },
}
