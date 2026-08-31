import type { Meta, StoryObj } from '@storybook/react-vite'
import { AboutDialog } from './AboutDialog'

const meta = {
  title: 'Navigation/AboutDialog',
  component: AboutDialog,
  parameters: { layout: 'fullscreen' },
  args: { onClose: () => {} },
} satisfies Meta<typeof AboutDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Open: Story = {
  args: { open: true },
}

export const Closed: Story = {
  args: { open: false },
}
