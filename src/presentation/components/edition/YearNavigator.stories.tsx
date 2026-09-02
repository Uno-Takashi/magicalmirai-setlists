import type { Meta, StoryObj } from '@storybook/react-vite'
import { fixtureCatalog } from '@/fixtures/catalog'
import { YearNavigator } from './YearNavigator'

// アプリと同じく新しい年が先の並びで渡す
const entries = [...fixtureCatalog.entries].reverse()

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
  args: { currentSlug: '2091' },
}

/** 最新の回。左端なので「新しい年へ」が無効になる。 */
export const NewestEdition: Story = {
  args: { currentSlug: '2093' },
}

/** 最初の回。右端なので「古い年へ」が無効になる。 */
export const OldestEdition: Story = {
  args: { currentSlug: '2090' },
}

/** 西暦と識別子が違う回。タブには slug ではなく西暦が出る。 */
export const SlugDiffersFromYear: Story = {
  args: { currentSlug: 'anniversary' },
}
