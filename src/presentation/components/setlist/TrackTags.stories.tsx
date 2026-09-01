import type { Meta, StoryObj } from '@storybook/react-vite'
import { TrackTags } from './TrackTags'

const meta = {
  title: 'Setlist/TrackTags',
  component: TrackTags,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof TrackTags>

export default meta
type Story = StoryObj<typeof meta>

/** 全種類。アイコンを持つタグと、文字だけのタグが混ざる。 */
export const AllTags: Story = {
  args: { tags: ['theme-song', 'grand-prix', 'encore', 'band-intro', 'bonus-track'] },
}

/** その年のテーマソング。旗のアイコンを添える。 */
export const ThemeSong: Story = {
  args: { tags: ['theme-song'] },
}

/** アンコールで演奏されたテーマソング。多くの年がこの組み合わせになる。 */
export const EncoreThemeSong: Story = {
  args: { tags: ['encore', 'theme-song'] },
}

/** タグの無い枠。何も描画しない。 */
export const NoTags: Story = {
  args: { tags: [] },
}
