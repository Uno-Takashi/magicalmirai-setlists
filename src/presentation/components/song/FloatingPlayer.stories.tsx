import type { Meta, StoryObj } from '@storybook/react-vite'
import { fixtureSong } from '@/fixtures/catalog'
import { PlayerProvider } from '@/presentation/providers/PlayerProvider'
import { FloatingPlayer } from './FloatingPlayer'

const meta = {
  title: 'Song/FloatingPlayer',
  component: FloatingPlayer,
  parameters: { layout: 'fullscreen' },
  args: { onExpand: () => {} },
  // 曲の詳細を閉じたあとの状態 (場所を貸す相手が居ない) を作る。
  decorators: [
    (Story) => (
      <PlayerProvider initialSong={fixtureSong('ネオンの通学路')}>
        <Story />
      </PlayerProvider>
    ),
  ],
} satisfies Meta<typeof FloatingPlayer>

export default meta
type Story = StoryObj<typeof meta>

/**
 * 右下に縮んだ状態。曲名と、広げる・閉じるの操作が帯に出る。
 *
 * 作り物のカタログなので動画 ID は実在せず、中身は再生されない。
 * 確かめたいのは右下の帯と寸法なので、それはこの状態でも見える。
 */
export const Minimized: Story = {}
