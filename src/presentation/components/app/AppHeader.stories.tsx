import type { Meta, StoryObj } from '@storybook/react-vite'
import { AppHeader } from './AppHeader'

/**
 * 画面の外枠のヘッダー。
 *
 * 右のボタンはどれもアイコンだけなので、読み上げ用の名前を持たせてある
 * (a11y アドオンで確かめられる)。狭い画面ではタイトルの文言を `sr-only` に
 * 落としてマークだけにするので、幅を変えて見え方を確かめる。
 */
const meta = {
  title: 'App/AppHeader',
  component: AppHeader,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AppHeader>

export default meta
type Story = StoryObj<typeof meta>

/** 既定。 */
export const Default: Story = {}

/** 狭い画面。タイトルの文言が隠れ、マークだけが残る。 */
export const Narrow: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
}
