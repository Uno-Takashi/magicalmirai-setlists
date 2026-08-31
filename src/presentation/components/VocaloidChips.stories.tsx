import type { Meta, StoryObj } from '@storybook/react-vite'
import { VocaloidChips } from './VocaloidChips'

const meta = {
  title: 'Vocaloid/VocaloidChips',
  component: VocaloidChips,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof VocaloidChips>

export default meta
type Story = StoryObj<typeof meta>

export const Single: Story = {
  args: { singers: ['miku'] },
}

export const Duo: Story = {
  args: { singers: ['rin', 'len'] },
}

/** 6 人全員。テーマカラーの並びを確認する。 */
export const All: Story = {
  args: { singers: ['miku', 'rin', 'len', 'luka', 'meiko', 'kaito'] },
}

/** 歌唱者が不明な曲。何も描画しない。 */
export const Unknown: Story = {
  args: { singers: [] },
}
