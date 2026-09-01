import type { Meta, StoryObj } from '@storybook/react-vite'
import { BsFlagFill } from 'react-icons/bs'
import { CollapsibleChip } from './CollapsibleChip'

const meta = {
  title: 'UI/CollapsibleChip',
  component: CollapsibleChip,
  parameters: { layout: 'centered' },
  args: {
    className: 'bg-miku/20 text-miku rounded px-1.5 py-0.5 text-[10px] leading-none font-semibold',
    mark: <BsFlagFill className="shrink-0" aria-hidden />,
    children: 'テーマソング',
  },
} satisfies Meta<typeof CollapsibleChip>

export default meta
type Story = StoryObj<typeof meta>

/**
 * 設定が既定 (省略しない) のとき。目印と文言が並ぶ。
 *
 * 省略表示にしたときの見え方は、設定モーダルで「タグを畳んで表示する」を
 * 入れてから見る (設定は Storybook 全体で共有される)。
 */
export const Default: Story = {}

/** 色の丸を目印にした場合。歌唱ボーカロイドのチップがこの形。 */
export const WithDot: Story = {
  args: {
    className: 'rounded-full px-1.5 py-0.5 text-[10px] leading-none font-medium',
    style: { backgroundColor: '#39C5BB26', color: '#39C5BB' },
    mark: (
      <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: '#39C5BB' }} />
    ),
    children: '初音ミク',
  },
}
