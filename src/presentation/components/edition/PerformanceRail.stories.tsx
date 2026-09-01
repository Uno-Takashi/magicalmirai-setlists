import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { findEntry } from '@/domain/catalog/Catalog'
import type { Performance } from '@/domain/edition/Performance'
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

/**
 * 3 公演。開催年をまたぐ札幌公演を含む。
 *
 * 札幌は日程が 2 日で他より少ないが、カードの高さは一番高いものに揃う。
 * 横幅も 3 枚で行いっぱいに広がり、セットリストや公演情報のトグルと端が揃う。
 */
export const ThreePerformancesAcrossYears: Story = {
  args: { performances: performancesOf('10th') },
  play: async ({ canvasElement }) => {
    const list = canvasElement.querySelector('ul')!
    const cards = [...list.querySelectorAll('li')]
    expect(cards).toHaveLength(3)

    // 行の左右が、置かれている箱の幅と一致する
    const row = list.getBoundingClientRect()
    const first = cards[0]!.getBoundingClientRect()
    const last = cards.at(-1)!.getBoundingClientRect()
    expect(first.left).toBeCloseTo(row.left, 0)
    expect(last.right).toBeCloseTo(row.right, 0)

    // 高さが揃っている (日程の少ない公演地だけ低くならない)
    const heights = cards.map((card) => Math.round(card.getBoundingClientRect().height))
    expect(new Set(heights).size).toBe(1)
  },
}

/**
 * 公演が 4 つ以上に増えた場合。データセットにまだ無いので、10th の公演地を
 * 増やしてこしらえている。基準の幅に収まらないので、縮めずに横スクロールへ逃がす。
 */
export const ManyPerformances: Story = {
  args: {
    performances: [
      ...performancesOf('10th'),
      ...performancesOf('2026').map((performance, index): Performance => ({
        ...performance,
        id: `extra-${index}`,
      })),
    ],
  },
}

/** 会場が未確定の年。 */
export const VenueUndecided: Story = {
  args: { performances: performancesOf('2026') },
}
