import type { Meta, StoryObj } from '@storybook/react-vite'
import { fixtureMainEntry, fixtureMultiSetlistEntry, fixtureSingleEntry } from '@/fixtures/catalog'
import { SetlistTimeline } from './SetlistTimeline'

const meta = {
  title: 'Setlist/SetlistTimeline',
  component: SetlistTimeline,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof SetlistTimeline>

export default meta
type Story = StoryObj<typeof meta>

/** 会場替わり・昼夜入れ替え・日程替わりと、ボーナストラックが一通り入った回。 */
export const WithVariants: Story = {
  args: { setlist: fixtureMainEntry.setlists[0]!, edition: fixtureMainEntry.edition },
}

/** 日替わりが一切ない最初期の公演。 */
export const FixedSetlist: Story = {
  args: { setlist: fixtureSingleEntry.setlists[0]!, edition: fixtureSingleEntry.edition },
}

/** 地方公演だけの短いセットリスト。 */
export const ShortSetlist: Story = {
  args: {
    setlist: fixtureMultiSetlistEntry.setlists[1]!,
    edition: fixtureMultiSetlistEntry.edition,
  },
}
