import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, type ComponentProps } from 'react'
import { SegmentedControl } from './SegmentedControl'

const MODES = ['perEdition', 'cumulative'] as const
type Mode = (typeof MODES)[number]

const LABELS: Record<Mode, string> = { perEdition: '年ごと', cumulative: '累積' }

/** 選択状態を持たせた見本。ストーリーから押して切り替えを試せるようにする。 */
function ControlDemo(props: ComponentProps<typeof SegmentedControl<Mode>>) {
  const [value, setValue] = useState<Mode>(props.value)
  return <SegmentedControl {...props} value={value} onChange={setValue} />
}

const meta = {
  title: 'UI/SegmentedControl',
  component: SegmentedControl,
  parameters: { layout: 'centered' },
  args: {
    label: '表示の切り替え',
    options: MODES,
    value: 'perEdition',
    onChange: () => {},
    renderLabel: (option: Mode) => LABELS[option],
  },
  // 押した結果を確かめられるよう、選択状態はストーリー側で持つ
  render: (args) => <ControlDemo {...args} />,
} satisfies Meta<typeof SegmentedControl<Mode>>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** 右側を選んだ状態。 */
export const SecondSelected: Story = {
  args: { value: 'cumulative' },
}
