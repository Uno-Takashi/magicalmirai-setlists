import type { Meta, StoryObj } from '@storybook/react-vite'
import { findEntry } from '@/domain/catalog/Catalog'
import { loadCatalog } from '@/infrastructure/dataset/loadCatalog'
import { EditionInfoPanel } from './EditionInfoPanel'

const catalog = loadCatalog()

function editionOf(slug: string) {
  const entry = findEntry(catalog, slug)
  if (entry === undefined) throw new Error(`${slug} の開催回がありません`)
  return entry.edition
}

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
  args: { edition: editionOf('2023') },
}

/** 1 公演だけの年。 */
export const SinglePerformance: Story = {
  args: { edition: editionOf('2013') },
}

/** 開催が年をまたぐ 10th。畳んだ状態でも期間で年またぎが分かる。 */
export const AcrossYears: Story = {
  args: { edition: editionOf('10th') },
}

/** 会場が未確定の年。 */
export const VenueUndecided: Story = {
  args: { edition: editionOf('2026') },
}
