import type { Meta, StoryObj } from '@storybook/react-vite'
import { StatisticsView } from './StatisticsView'

const meta = {
  title: 'Statistics/StatisticsView',
  component: StatisticsView,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof StatisticsView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
