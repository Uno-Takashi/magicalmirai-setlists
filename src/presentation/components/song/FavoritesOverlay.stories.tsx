import type { Meta, StoryObj } from '@storybook/react-vite'
import { FavoritesProvider } from '@/presentation/providers/FavoritesProvider'
import { FavoritesOverlay } from './FavoritesOverlay'

const meta = {
  title: 'Song/FavoritesOverlay',
  component: FavoritesOverlay,
  parameters: { layout: 'fullscreen' },
  args: { open: true, onClose: () => {}, onSelectSong: () => {}, onSelectEdition: () => {} },
} satisfies Meta<typeof FavoritesOverlay>

export default meta
type Story = StoryObj<typeof meta>

/** 何曲か入れた状態。行の見せ方は検索結果と同じ。 */
export const WithSongs: Story = {
  decorators: [
    (Story) => (
      <FavoritesProvider initialTitles={['ロキ', 'Hand in Hand', 'テオ']}>
        <Story />
      </FavoritesProvider>
    ),
  ],
}

/** まだ何も入れていない状態。入れ方を案内する。 */
export const Empty: Story = {
  decorators: [
    (Story) => (
      <FavoritesProvider initialTitles={[]}>
        <Story />
      </FavoritesProvider>
    ),
  ],
}

export const Closed: Story = {
  args: { open: false },
}
