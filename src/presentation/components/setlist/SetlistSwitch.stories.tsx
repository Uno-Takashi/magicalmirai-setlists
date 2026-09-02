import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, type ComponentProps } from 'react'
import type { Setlist } from '@/domain/setlist/Setlist'
import { fixtureMainEntry, fixtureMultiSetlistEntry } from '@/fixtures/catalog'
import { SetlistSwitch } from './SetlistSwitch'

/** 選択状態を持たせた見本。ストーリーから押して切り替えを試せるようにする。 */
function SwitchDemo(props: ComponentProps<typeof SetlistSwitch>) {
  const [index, setIndex] = useState(props.selectedIndex)
  return <SetlistSwitch {...props} selectedIndex={index} onSelect={setIndex} />
}

const meta = {
  title: 'Setlist/SetlistSwitch',
  component: SetlistSwitch,
  parameters: { layout: 'padded' },
  args: { selectedIndex: 0, onSelect: () => {} },
  // 押した結果を確かめられるよう、選択状態はストーリー側で持つ
  render: (args) => <SwitchDemo {...args} />,
} satisfies Meta<typeof SetlistSwitch>

export default meta
type Story = StoryObj<typeof meta>

const { edition, setlists } = fixtureMultiSetlistEntry

/** セットリストが 1 つだけの回。切り替えるものが無いので何も出さない。 */
export const SingleSetlist: Story = {
  args: { setlists: fixtureMainEntry.setlists, edition: fixtureMainEntry.edition },
}

/** 2 つのセットリストを切り替える回。札の色は適用先の公演地に合わせる。 */
export const TwoSetlists: Story = {
  args: { setlists, edition },
}

/** 3 つに増えた場合。公演地ごとに 1 つずつ割り当てて、札が並ぶ様子を見る。 */
export const ThreeSetlists: Story = {
  args: {
    edition,
    setlists: edition.performances.map((performance, index): Setlist => ({
      performanceIds: [performance.id],
      tracks: setlists[index]?.tracks ?? setlists[0]!.tracks,
    })),
  },
}

/**
 * 適用先の公演地が分からないセットリストが混ざる場合。
 * 名前を組み立てられないので「セットリスト 2」のように番号で呼ぶ。
 */
export const UnknownPerformance: Story = {
  args: {
    edition,
    setlists: [setlists[0]!, { performanceIds: [], tracks: setlists[1]!.tracks }],
  },
}
