import type { Meta, StoryObj } from '@storybook/react-vite'
import { findEntry } from '@/domain/catalog/Catalog'
import { loadCatalog } from '@/infrastructure/dataset/loadCatalog'
import { PerformanceRail } from './PerformanceRail'

const catalog = loadCatalog()

function performancesOf(slug: string) {
  return findEntry(catalog, slug)?.edition.performances ?? []
}

const meta = {
  title: 'Setlist/PerformanceRail',
  component: PerformanceRail,
  parameters: { layout: 'padded' },
  args: { onShowDetail: () => {} },
} satisfies Meta<typeof PerformanceRail>

export default meta
type Story = StoryObj<typeof meta>

/** 1 公演のみ。マジカルミライ初年度。 */
export const SinglePerformance: Story = {
  args: { performances: performancesOf('2013') },
}

/** 東京・大阪の 2 公演。 */
export const TwoPerformances: Story = {
  args: { performances: performancesOf('2023') },
}

/** 3 公演。開催年をまたぐ札幌公演を含む。 */
export const ThreePerformancesAcrossYears: Story = {
  args: { performances: performancesOf('10th') },
}

/** 会場が未確定の年。 */
export const VenueUndecided: Story = {
  args: { performances: performancesOf('2026') },
}
