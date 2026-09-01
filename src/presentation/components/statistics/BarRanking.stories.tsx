import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
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

/**
 * 画面の狭い端末。曲名と作曲者を続けた長い見出しでも、棒が箱からはみ出さないこと。
 *
 * 行は grid の子なので、既定では中身の min-content より狭くならない。見出しは
 * truncate (nowrap) なので min-content が文言の全長になり、放っておくと一番長い行に
 * 合わせて列全体が広がって、棒がカードの外まで伸びる (統計の「演奏回数」で起きていた)。
 */
export const NarrowScreen: Story = {
  args: {
    valueSuffix: '回',
    rows: [
      {
        id: 'a',
        label: '初音ミクの消失 -DEAD END-',
        sublabel: 'cosMo@暴走P / 名前のとても長いプロデューサー',
        value: 12,
        note: '累計 21 演奏',
      },
      { id: 'b', label: 'ロミオとシンデレラ', sublabel: 'doriko(きりたんP)', value: 7 },
      { id: 'c', label: '39', sublabel: 'sasakure.UK×DECO*27', value: 5 },
    ],
  },
  // 320px 幅の端末で、統計のカードに収まっている状態を作る
  decorators: [
    (Story) => (
      <div data-testid="card" className="surface-card w-[320px] rounded-2xl p-4">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector('[data-testid="card"]')!
    const style = getComputedStyle(card)
    // padding の内側 (中身を置ける範囲) の右端
    const limit =
      card.getBoundingClientRect().right -
      Number.parseFloat(style.paddingRight) -
      Number.parseFloat(style.borderRightWidth)

    for (const row of card.querySelectorAll('ol li')) {
      expect(row.getBoundingClientRect().right).toBeLessThanOrEqual(limit + 1)
    }
  },
}
