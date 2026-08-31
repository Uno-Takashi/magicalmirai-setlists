import type { Meta, StoryObj } from '@storybook/react-vite'
import { findEntry } from '@/domain/catalog/Catalog'
import { loadCatalog } from '@/infrastructure/dataset/loadCatalog'
import { PerformanceDialog } from './PerformanceDialog'

const catalog = loadCatalog()

function performanceOf(slug: string, id: string) {
  return findEntry(catalog, slug)?.edition.performances.find((p) => p.id === id) ?? null
}

const meta = {
  title: 'Setlist/PerformanceDialog',
  component: PerformanceDialog,
  parameters: { layout: 'fullscreen' },
  args: { onClose: () => {} },
} satisfies Meta<typeof PerformanceDialog>

export default meta
type Story = StoryObj<typeof meta>

/** 使用施設まで公式サイトに出ている年。 */
export const WithHalls: Story = {
  args: { performance: performanceOf('2026', 'hamamatsu') },
}

/** ライブと企画展で使う施設が分かれている年。 */
export const LiveAndExhibitionHalls: Story = {
  args: { performance: performanceOf('2019', 'osaka') },
}

/** 使用施設の記載が無い年。会場名・地図・日程だけになる。 */
export const VenueOnly: Story = {
  args: { performance: performanceOf('2013', 'yokohama') },
}

/** 昼夜の区別が無い年。日程は Day.1 などの表示ラベルで出る。 */
export const WithoutSessions: Story = {
  args: { performance: performanceOf('2020', 'tokyo') },
}
