import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
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

/**
 * 年送りのカルーセルの中から開いたときも、画面に貼り付いたままになること。
 *
 * カルーセルはスライドを transform で動かしており、transform の掛かった祖先は
 * position: fixed の基準になる。ポータルで body へ逃がしていないと、モーダルは
 * 画面ではなくスライドの箱を基準に置かれ、ページと一緒に流れて見えなくなる。
 */
export const InsideTransformedAncestor: Story = {
  args: { performance: performanceOf('2026', 'osaka') },
  decorators: [
    (Story) => (
      <div style={{ transform: 'translateX(0px)', height: '300vh' }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const dialog = canvasElement.ownerDocument.body.querySelector('[role="dialog"]')
    expect(dialog).not.toBeNull()

    // 画面の中に収まっていれば、fixed の基準が transform 祖先に奪われていない
    const box = dialog!.getBoundingClientRect()
    const viewport = canvasElement.ownerDocument.defaultView!.innerHeight
    expect(box.top).toBeLessThan(viewport)
    expect(box.bottom).toBeGreaterThan(0)
  },
}
