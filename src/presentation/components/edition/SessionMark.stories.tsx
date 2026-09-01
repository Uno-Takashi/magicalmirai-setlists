import type { Meta, StoryObj } from '@storybook/react-vite'
import { SessionBadge, SessionMark } from './SessionMark'

const meta = {
  title: 'Setlist/SessionMark',
  component: SessionBadge,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof SessionBadge>

export default meta
type Story = StoryObj<typeof meta>

/** モーダル向け。アイコンと文言を並べる。 */
export const Badges: Story = {
  args: { session: 'matinee' },
  render: () => (
    <div className="flex gap-2">
      <SessionBadge session="matinee" />
      <SessionBadge session="evening" />
    </div>
  ),
}

/** 公演地カード向け。アイコンだけで、文言は読み上げ専用。 */
export const Marks: Story = {
  args: { session: 'matinee' },
  render: () => (
    <div className="flex gap-2">
      <SessionMark session="matinee" />
      <SessionMark session="evening" />
    </div>
  ),
}
