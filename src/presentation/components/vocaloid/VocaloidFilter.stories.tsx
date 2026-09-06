import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { VocaloidId } from '@/domain/vocaloid/Vocaloid'
import { fixtureVocaloidIds } from '@/fixtures/catalog'
import { VocaloidFilter } from './VocaloidFilter'

/**
 * ボーカロイドでの絞り込み。
 *
 * 選択中はテーマカラー、未選択は淡いグレー。色だけに頼らないよう名前は常に出し、
 * 状態は `aria-pressed` でも伝える。
 */
const meta = {
  title: 'Vocaloid/VocaloidFilter',
  component: VocaloidFilter,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof VocaloidFilter>

export default meta
type Story = StoryObj<typeof meta>

/** 押して切り替えられるようにした見本。 */
function Interactive({ initial }: { initial: readonly VocaloidId[] }) {
  const [selected, setSelected] = useState<ReadonlySet<VocaloidId>>(new Set(initial))

  return (
    <VocaloidFilter
      selected={selected}
      onToggle={(id) =>
        setSelected((current) => {
          const next = new Set(current)
          if (next.has(id)) next.delete(id)
          else next.add(id)
          return next
        })
      }
    />
  )
}

/** 既定は全員 on (= 絞り込みなし)。6 人のテーマカラーが並ぶ。 */
export const AllSelected: Story = {
  args: { selected: new Set(fixtureVocaloidIds), onToggle: () => {} },
  render: () => <Interactive initial={fixtureVocaloidIds} />,
}

/** 一部だけを選んだ状態。選択と未選択の見分けが付くかを確かめる。 */
export const PartiallySelected: Story = {
  args: { selected: new Set(['miku', 'rin']), onToggle: () => {} },
  render: () => <Interactive initial={['miku', 'rin']} />,
}

/** 誰も選んでいない状態。全員が淡いグレーになる。 */
export const NoneSelected: Story = {
  args: { selected: new Set(), onToggle: () => {} },
  render: () => <Interactive initial={[]} />,
}
