import type { Meta, StoryObj } from '@storybook/react-vite'
import { ProducerChips } from './ProducerChips'

const meta = {
  title: 'Song/ProducerChips',
  component: ProducerChips,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ProducerChips>

export default meta
type Story = StoryObj<typeof meta>

/** 作曲者が 1 人。ほとんどの曲がこの形。 */
export const Single: Story = {
  args: { producers: ['サンプルP'] },
}

/** 合作。1 つにまとめず、作曲者ごとに札を分ける。 */
export const Collaboration: Story = {
  args: { producers: ['サンプルP', 'モックP'] },
}

/** 長い名前。折り返しても札が崩れないかを見る。 */
export const LongName: Story = {
  args: { producers: ['とてもながい名前のプロデューサー', 'ダミーP'] },
}

/** 作曲者が不明な曲。何も描画しない。 */
export const Unknown: Story = {
  args: { producers: [] },
}
