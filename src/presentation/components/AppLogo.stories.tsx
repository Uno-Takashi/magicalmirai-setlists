import type { Meta, StoryObj } from '@storybook/react-vite'
import { AppLogo } from './AppLogo'

const meta = {
  title: 'App/AppLogo',
  component: AppLogo,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof AppLogo>

export default meta
type Story = StoryObj<typeof meta>

/** ヘッダーでの実寸。 */
export const Header: Story = {
  args: { className: 'size-8' },
}

/** ファビコンの実寸。旋律の線だけが残り、粒の並びが読めるかを見る。 */
export const Favicon: Story = {
  args: { className: 'size-4' },
}

/** 拡大して形を確かめる。 */
export const Large: Story = {
  args: { className: 'size-32' },
}
