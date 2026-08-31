import type { Meta, StoryObj } from '@storybook/react-vite'
import SplitText from './SplitText'

const meta = {
  title: 'React Bits/SplitText',
  component: SplitText,
  parameters: { layout: 'centered' },
  args: {
    text: 'マジカルミライ セットリスト',
    className: 'text-3xl font-bold',
    tag: 'h2',
  },
} satisfies Meta<typeof SplitText>

export default meta
type Story = StoryObj<typeof meta>

export const Chars: Story = {}

export const Words: Story = {
  args: { text: 'Magical Mirai Setlist Archive', splitType: 'words' },
}
