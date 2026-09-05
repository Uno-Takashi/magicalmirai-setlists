import type { Meta, StoryObj } from '@storybook/react-vite'
import { EditionBackdrop } from './EditionBackdrop'

/**
 * 開催回の背景。実際は開催回の中身の下に敷くので、ここでは高さのある箱に入れて
 * 単体で見せる。色と意匠は `editionThemes.ts` の表が持つ。
 */
const meta = {
  title: 'Setlist/EditionBackdrop',
  component: EditionBackdrop,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="relative h-[640px] w-full overflow-hidden">
        <Story />
        <div className="relative mx-auto w-full max-w-3xl px-4 pt-6">
          <h2 className="text-miku text-2xl leading-snug font-black sm:text-3xl">
            マジカルミライ 20XX
          </h2>
          <p className="surface-card mt-5 rounded-2xl p-5 text-sm">
            文字とカードがこの背景の上でどう見えるかを確かめる。
          </p>
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof EditionBackdrop>

export default meta
type Story = StoryObj<typeof meta>

/** 2026。若草色から水色へのグラデーションに、ヒマワリを散らす。 */
export const Sunflower: Story = {
  args: { theme: { colors: ['#ECFEE8', '#E4FEFD'], motif: 'sunflower' } },
}

/** 2025。濃紺から水色、藤色へのグラデーションに、白い点の星を散らす。 */
export const Starfield: Story = {
  args: { theme: { colors: ['#0C2E64', '#78D9E1', '#CBC1FB'], motif: 'starfield' } },
}

/** 2024。水色から淡い水色へ。星・丸・角丸の三角を薄く散らす。 */
export const Shapes: Story = {
  args: { theme: { colors: ['#85D5DE', '#D8F4F5'], motif: 'shapes' } },
}

/** 2023。黒一色の地に、白い線の星・三角・ひし形を赤いネオンで光らせる。 */
export const Neon: Story = {
  args: { theme: { colors: ['#000000'], motif: 'neon', titleColor: '#FFFFFF' } },
}

/** 2021。青から白へ抜ける空に、うっすら雲を浮かべる。 */
export const Sky: Story = {
  args: { theme: { colors: ['#7FA5CA', '#FFFFFF'], motif: 'cloud', titleColor: '#1B3A63' } },
}

/** 左右にうっすら浮かべる敷き方 (10th)。真ん中は素の地色のまま残る。 */
export const Sides: Story = {
  args: { theme: { colors: ['#9DF1FC', '#F898E0'], layout: 'sides', titleColor: '#06B6E3' } },
}

/** モチーフの無い年。色だけを敷く。 */
export const ColorsOnly: Story = {
  args: { theme: { colors: ['#ECFEE8', '#E4FEFD'] } },
}

/** 単色の年。1 色でもグラデーションの式はそのまま使える。 */
export const SingleColor: Story = {
  args: { theme: { colors: ['#ECFEE8'] } },
}
