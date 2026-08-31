import type { Meta, StoryObj } from '@storybook/react-vite'
import { EditionSideNav } from './EditionSideNav'

const meta = {
  title: 'Navigation/EditionSideNav',
  component: EditionSideNav,
  parameters: { layout: 'fullscreen' },
  args: { onNewer: () => {}, onOlder: () => {} },
} satisfies Meta<typeof EditionSideNav>

export default meta
type Story = StoryObj<typeof meta>

/** 前後どちらにも動ける中間の年。 */
export const Both: Story = {
  args: { canGoNewer: true, canGoOlder: true },
}

/** 最新の年。「新しい年へ」が無効になる。 */
export const NewestEdition: Story = {
  args: { canGoNewer: false, canGoOlder: true },
}

/** 最初の年。「古い年へ」が無効になる。 */
export const OldestEdition: Story = {
  args: { canGoNewer: true, canGoOlder: false },
}
