import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, type ComponentProps } from 'react'
import { findEntry } from '@/domain/catalog/Catalog'
import type { Setlist } from '@/domain/setlist/Setlist'
import { loadCatalog } from '@/infrastructure/dataset/loadCatalog'
import { SetlistSwitch } from './SetlistSwitch'

const catalog = loadCatalog()

function entryOf(slug: string) {
  const entry = findEntry(catalog, slug)
  if (entry === undefined) throw new Error(`${slug} の開催回がありません`)
  return entry
}

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

const tenth = entryOf('10th')

/** セットリストが 1 つだけの年。切り替えるものが無いので何も出さない。 */
export const SingleSetlist: Story = {
  args: { setlists: entryOf('2023').setlists, edition: entryOf('2023').edition },
}

/** 10th。東京・大阪と、曲目が大きく違う札幌の 2 つを切り替える。 */
export const TwoSetlists: Story = {
  args: { setlists: tenth.setlists, edition: tenth.edition },
}

/**
 * セットリストが 3 つに増えた場合。データセットにまだ無いので、10th の公演地を
 * 1 つずつに割ってこしらえている。3 つ以上でも札が折り返して並ぶことを見る。
 */
export const ThreeSetlists: Story = {
  args: {
    edition: tenth.edition,
    setlists: tenth.edition.performances.map((performance, index): Setlist => ({
      performanceIds: [performance.id],
      tracks: tenth.setlists[index]?.tracks ?? tenth.setlists[0]?.tracks ?? [],
    })),
  },
}

/**
 * 適用先の公演地が分からないセットリストが混ざる場合。
 * 名前を組み立てられないので「セットリスト 2」のように番号で呼ぶ。
 */
export const UnknownPerformance: Story = {
  args: {
    edition: tenth.edition,
    setlists: [tenth.setlists[0]!, { performanceIds: [], tracks: tenth.setlists[1]?.tracks ?? [] }],
  },
}
