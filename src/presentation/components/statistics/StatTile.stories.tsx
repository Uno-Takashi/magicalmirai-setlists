import type { Meta, StoryObj } from '@storybook/react-vite'
import { StatTile } from './StatTile'

const meta = {
  title: 'Statistics/StatTile',
  component: StatTile,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof StatTile>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { label: '開催回', value: 12, unit: '回' },
}

/** 統計ページと同じ 3 つ並び。 */
export const Row: Story = {
  args: { label: '開催回', value: 12, unit: '回' },
  render: () => (
    <div className="grid grid-cols-3 gap-2">
      <StatTile label="開催回" value={12} unit="回" />
      <StatTile label="累計演奏" value={438} unit="回" />
      <StatTile label="ボカロ P" value={126} unit="人" />
    </div>
  ),
}
