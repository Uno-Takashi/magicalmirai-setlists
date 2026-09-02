import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor } from 'storybook/test'
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

/**
 * 開いたところ。高さが伸びながら中身が浮かび上がる。
 *
 * 伸びている間だけ高さで切り取るので、開き切ったあとは overflow が戻り、
 * 公演地カードの hover の影が下端で切れない。
 */
export const Expanded: Story = {
  args: { edition: fixtureMainEntry.edition },
  play: async ({ canvasElement }) => {
    const toggle = canvasElement.querySelector('button')!
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')

    const content = canvasElement.ownerDocument.getElementById(
      toggle.getAttribute('aria-controls')!,
    )
    expect(content).not.toBeNull()

    await waitFor(() => {
      expect(content!.getBoundingClientRect().height).toBeGreaterThan(0)
      expect(getComputedStyle(content!).overflow).toBe('visible')
    })
  },
}
