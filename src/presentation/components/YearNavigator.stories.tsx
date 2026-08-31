import type { Meta, StoryObj } from '@storybook/react-vite'
import { loadCatalog } from '@/infrastructure/dataset/loadCatalog'
import { YearNavigator } from './YearNavigator'

const catalog = loadCatalog()
// アプリと同じく新しい年が先の並びで渡す
const entries = [...catalog.entries].reverse()

const meta = {
  title: 'Navigation/YearNavigator',
  component: YearNavigator,
  parameters: { layout: 'padded' },
  args: {
    entries,
    onSelect: () => {},
    onNewer: () => {},
    onOlder: () => {},
  },
} satisfies Meta<typeof YearNavigator>

export default meta
type Story = StoryObj<typeof meta>

export const Middle: Story = {
  args: { currentSlug: '2019' },
}

/** 最新の年。左端なので「新しい年へ」が無効になる。 */
export const NewestEdition: Story = {
  args: { currentSlug: '2026' },
}

/** 最初の年。右端なので「古い年へ」が無効になる。 */
export const OldestEdition: Story = {
  args: { currentSlug: '2013' },
}

/** 10 周年の回。タブには slug ではなく西暦 (2022) が出る。 */
export const TenthAnniversary: Story = {
  args: { currentSlug: '10th' },
}
