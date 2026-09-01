import type { Meta, StoryObj } from '@storybook/react-vite'
import { loadCatalog } from '@/infrastructure/dataset/loadCatalog'
import { PlayerProvider } from '@/presentation/providers/PlayerProvider'
import { FloatingPlayer } from './FloatingPlayer'

const catalog = loadCatalog()

function song(title: string) {
  const found = catalog.songs.get(title)
  if (found === undefined) throw new Error(`${title} が dataset/songs.yaml にありません`)
  return found
}

const meta = {
  title: 'Song/FloatingPlayer',
  component: FloatingPlayer,
  parameters: { layout: 'fullscreen' },
  args: { onExpand: () => {} },
  // 曲の詳細を閉じたあとの状態 (場所を貸す相手が居ない) を作る。
  decorators: [
    (Story) => (
      <PlayerProvider initialSong={song('Tell Your World')}>
        <Story />
      </PlayerProvider>
    ),
  ],
} satisfies Meta<typeof FloatingPlayer>

export default meta
type Story = StoryObj<typeof meta>

/** 右下に縮んだ状態。閉じるボタンで再生を終える。 */
export const Minimized: Story = {}
