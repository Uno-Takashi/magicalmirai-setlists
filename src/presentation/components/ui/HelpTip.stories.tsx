import type { Meta, StoryObj } from '@storybook/react-vite'
import { HelpTip } from './HelpTip'

const meta = {
  title: 'UI/HelpTip',
  component: HelpTip,
  parameters: { layout: 'centered' },
  args: { text: '同じ回のなかで同じ曲が何度出ても、1 回として数えます。' },
} satisfies Meta<typeof HelpTip>

export default meta
type Story = StoryObj<typeof meta>

/** 既定。マウスを乗せるかキーボードで焦点を当てると説明が出る。 */
export const Default: Story = {}

/** 見出しの横に置いた様子。文字の並びから浮かない大きさかを見る。 */
export const BesideHeading: Story = {
  render: (args) => (
    <h2 className="flex items-center gap-1 text-sm font-semibold">
      累計の演奏回数
      <HelpTip {...args} />
    </h2>
  ),
}

/** 長い説明。札の幅で折り返り、読める行長に収まるかを見る。 */
export const LongText: Story = {
  args: {
    text: '公演地によって数曲が異なり、同じ公演地でも日替わりで曲が変わります。昼公演と夜公演で異なる場合もあるため、曲順の枠は 1 曲に固定されません。',
  },
}
