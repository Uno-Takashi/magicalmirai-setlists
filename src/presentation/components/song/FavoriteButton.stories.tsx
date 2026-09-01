import type { Meta, StoryObj } from '@storybook/react-vite'
import { FavoritesProvider } from '@/presentation/providers/FavoritesProvider'
import { FavoriteButton } from './FavoriteButton'

const meta = {
  title: 'Song/FavoriteButton',
  component: FavoriteButton,
  parameters: { layout: 'centered' },
  args: { title: 'ロキ' },
} satisfies Meta<typeof FavoriteButton>

export default meta
type Story = StoryObj<typeof meta>

/** まだ入れていない曲。押すと入る。 */
export const NotAdded: Story = {
  decorators: [
    (Story) => (
      <FavoritesProvider initialTitles={[]}>
        <Story />
      </FavoritesProvider>
    ),
  ],
}

/** すでに入れてある曲。押すと外れる。 */
export const Added: Story = {
  decorators: [
    (Story) => (
      <FavoritesProvider initialTitles={['ロキ']}>
        <Story />
      </FavoritesProvider>
    ),
  ],
}
