import type { Meta, StoryObj } from '@storybook/react-vite'
import { BackToStatistics } from './BackToStatistics'

const meta = {
  title: 'Statistics/BackToStatistics',
  component: BackToStatistics,
  args: { onBack: () => {} },
} satisfies Meta<typeof BackToStatistics>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
