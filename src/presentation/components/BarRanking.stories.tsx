import type { Meta, StoryObj } from '@storybook/react-vite'
import { BarRanking } from './BarRanking'

const meta = {
  title: 'Statistics/BarRanking',
  component: BarRanking,
  parameters: { layout: 'padded' },
  args: { valueSuffix: '曲' },
} satisfies Meta<typeof BarRanking>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    rows: [
      { id: 'a', label: 'DECO*27', value: 12, note: '累計 18 演奏' },
      { id: 'b', label: 'livetune', value: 9, note: '累計 21 演奏' },
      { id: 'c', label: 'wowaka', value: 7, note: '累計 11 演奏' },
      { id: 'd', label: 'ピノキオピー', value: 6, note: '累計 9 演奏' },
    ],
  },
}

/** キャラクターのテーマカラーを行頭のドットで添えた場合。識別は文字ラベルが担う。 */
export const WithAccent: Story = {
  args: {
    rows: [
      { id: 'miku', label: '初音ミク', value: 29, accent: '#39C5BB' },
      { id: 'rin', label: '鏡音リン', value: 5, accent: '#FFCC11' },
      { id: 'len', label: '鏡音レン', value: 4, accent: '#FFEE11' },
      { id: 'luka', label: '巡音ルカ', value: 4, accent: '#FFBACC' },
    ],
  },
}

/** 値が 0 の行を含む場合。 */
export const WithZero: Story = {
  args: {
    rows: [
      { id: 'a', label: 'あるP', value: 3 },
      { id: 'b', label: '別のP', value: 0 },
    ],
  },
}
