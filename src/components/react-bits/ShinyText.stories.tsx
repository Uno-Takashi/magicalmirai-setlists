import type { Meta, StoryObj } from '@storybook/react-vite'
import ShinyText from './ShinyText'

const meta = {
  title: 'React Bits/ShinyText',
  component: ShinyText,
  parameters: { layout: 'centered' },
  args: {
    text: 'Magical Mirai Setlist',
    speed: 4,
    className: 'text-2xl font-semibold',
  },
} satisfies Meta<typeof ShinyText>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Disabled: Story = {
  args: { disabled: true },
}
