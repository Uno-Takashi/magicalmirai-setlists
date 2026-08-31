import type { Meta, StoryObj } from '@storybook/react-vite'
import { RankingView } from './RankingView'

const meta = {
  title: 'Statistics/RankingView',
  component: RankingView,
  parameters: { layout: 'fullscreen' },
  args: { onSelectSong: () => {} },
} satisfies Meta<typeof RankingView>

export default meta
type Story = StoryObj<typeof meta>

/** ボカロ P ごとの採用楽曲数。同率の順位が並ぶ。 */
export const Producers: Story = {
  args: { ranking: 'producers' },
}

export const Songs: Story = {
  args: { ranking: 'songs' },
}
