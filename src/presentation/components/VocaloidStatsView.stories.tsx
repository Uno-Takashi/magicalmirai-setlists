import type { Meta, StoryObj } from '@storybook/react-vite'
import { VocaloidStatsView } from './VocaloidStatsView'

const meta = {
  title: 'Statistics/VocaloidStatsView',
  component: VocaloidStatsView,
  parameters: { layout: 'fullscreen' },
  args: { onBack: () => {} },
} satisfies Meta<typeof VocaloidStatsView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
