import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  fixtureMainEntry,
  fixtureMultiSetlistEntry,
  fixtureSingleEntry,
  fixtureUpcomingEntry,
} from '@/fixtures/catalog'
import { EditionInfoPanel } from './EditionInfoPanel'

const meta = {
  title: 'Setlist/EditionInfoPanel',
  component: EditionInfoPanel,
  parameters: { layout: 'padded' },
  args: { onShowPerformance: () => {} },
} satisfies Meta<typeof EditionInfoPanel>

export default meta
type Story = StoryObj<typeof meta>

/** 既定の畳んだ状態。日程と公演数だけが見える。 */
export const Collapsed: Story = {
  args: { edition: fixtureMainEntry.edition },
}

/** 1 公演だけの回。 */
export const SinglePerformance: Story = {
  args: { edition: fixtureSingleEntry.edition },
}

/** 開催が年をまたぐ回。畳んだ状態でも期間で年またぎが分かる。 */
export const AcrossYears: Story = {
  args: { edition: fixtureMultiSetlistEntry.edition },
}

/** 会場が未確定の回。 */
export const VenueUndecided: Story = {
  args: { edition: fixtureUpcomingEntry.edition },
}
