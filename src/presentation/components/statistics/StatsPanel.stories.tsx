import type { Meta, StoryObj } from '@storybook/react-vite'
import { BarRanking } from './BarRanking'
import { StatsPanel } from './StatsPanel'

const ROWS = [
  { id: 'a', label: 'DECO*27', value: 12 },
  { id: 'b', label: 'livetune', value: 9 },
]

const meta = {
  title: 'Statistics/StatsPanel',
  component: StatsPanel,
  parameters: { layout: 'padded' },
  args: { children: <BarRanking rows={ROWS} valueSuffix="曲" /> },
} satisfies Meta<typeof StatsPanel>

export default meta
type Story = StoryObj<typeof meta>

export const WithTitle: Story = {
  args: { title: 'ボカロ P ごとの採用楽曲数' },
}

/** 見出しの横に「?」を出し、下に「もっと見る」を置いた場合。 */
export const WithHelpAndShowAll: Story = {
  args: {
    title: 'よく演奏される曲',
    help: '同じ開催回で何度演奏されても 1 と数える。',
    onShowAll: () => {},
  },
}

/** 見出しを省いた箱。ページの見出しで何の表かが分かっているときに使う。 */
export const WithoutTitle: Story = {}
