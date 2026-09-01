import type { Meta, StoryObj } from '@storybook/react-vite'
import { SettingsDialog } from './SettingsDialog'

const meta = {
  title: 'Navigation/SettingsDialog',
  component: SettingsDialog,
  parameters: { layout: 'fullscreen' },
  args: { onClose: () => {} },
} satisfies Meta<typeof SettingsDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Open: Story = {
  args: { open: true },
}

export const Closed: Story = {
  args: { open: false },
}
