import type { Meta, StoryObj } from '@storybook/react-vite'
import { Shape, type ShapeKind } from './Shape'

/**
 * 背景に散らす図形 1 つ。
 *
 * 線の色は呼ぶ側の `currentColor` に従うので、色は外側で決める。
 * 2024 (薄く散らす) と 2023 (ネオンで光らせる) の両方がこれを使う。
 */
const meta = {
  title: 'Edition/MotifShape',
  component: Shape,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="w-32 text-slate-700">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Shape>

export default meta
type Story = StoryObj<typeof meta>

const KINDS: readonly ShapeKind[] = ['circle', 'star', 'triangle', 'diamond']

/** 4 つの形を、塗りと輪郭で並べる。 */
export const AllKinds: Story = {
  args: { kind: 'star', outlined: false },
  render: () => (
    <div className="grid grid-cols-4 gap-4 text-slate-700">
      {[false, true].map((outlined) =>
        KINDS.map((kind) => (
          <div key={`${kind}-${String(outlined)}`} className="w-20">
            <Shape kind={kind} outlined={outlined} />
          </div>
        )),
      )}
    </div>
  ),
}

/** 塗りつぶした星。中の星が二重に見える。 */
export const FilledStar: Story = {
  args: { kind: 'star', outlined: false },
}

/** 輪郭だけの星。ネオンはこの形を細い線で描く。 */
export const OutlinedStar: Story = {
  args: { kind: 'star', outlined: true, lineWidth: 2 },
}

/** 色を敷いて白い線で縁取る。ネオンのひし形がこの形。 */
export const NeonDiamond: Story = {
  args: { kind: 'diamond', outlined: false, fillColor: '#FF4FA3' },
  decorators: [
    (Story) => (
      <div className="w-32 bg-black p-4 text-white">
        <Story />
      </div>
    ),
  ],
}

/** 線を太くしたとき。輪郭の太さは年ごとに変える。 */
export const ThickOutline: Story = {
  args: { kind: 'triangle', outlined: true, lineWidth: 12 },
}
