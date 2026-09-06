import type { Meta, StoryObj } from '@storybook/react-vite'
import { EditionYearBadge } from './EditionYearBadge'

/**
 * 開催回を西暦の小さな札で示すボタン。
 *
 * 中身が数字だけなので、読み上げ用の名前を `aria-label` で補っている
 * (a11y アドオンで名前が付いているかを確かめられる)。
 */
const meta = {
  title: 'Edition/EditionYearBadge',
  component: EditionYearBadge,
  parameters: { layout: 'centered' },
  args: { year: 2091, onSelect: () => {} },
} satisfies Meta<typeof EditionYearBadge>

export default meta
type Story = StoryObj<typeof meta>

/** 既定。 */
export const Default: Story = {}

/** 検索結果のように、複数の年を横に並べたとき。 */
export const Row: Story = {
  render: (args) => (
    <span className="flex flex-wrap items-center gap-1">
      {[2090, 2091, 2092, 2093].map((year) => (
        <EditionYearBadge key={year} {...args} year={year} />
      ))}
    </span>
  ),
}
