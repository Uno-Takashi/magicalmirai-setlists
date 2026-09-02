import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { fixturePerformance, fixtureUpcomingEntry } from '@/fixtures/catalog'
import { PerformanceDialog } from './PerformanceDialog'

const meta = {
  title: 'Setlist/PerformanceDialog',
  component: PerformanceDialog,
  parameters: { layout: 'fullscreen' },
  args: { onClose: () => {} },
} satisfies Meta<typeof PerformanceDialog>

export default meta
type Story = StoryObj<typeof meta>

/** 使用施設まで分かっている公演。会場名の下に施設名が出る。 */
export const WithHalls: Story = {
  args: { performance: fixturePerformance('tokyo') },
}

/** 使用施設の記載が無い公演。会場名・地図・日程だけになる。 */
export const VenueOnly: Story = {
  args: { performance: fixturePerformance('osaka') },
}

/** 昼夜の区別が無い公演。日程は Day.1 などの表示ラベルで出る。 */
export const WithoutSessions: Story = {
  args: { performance: fixtureUpcomingEntry.edition.performances[0]! },
}

/**
 * 年送りのカルーセルの中から開いたときも、画面に貼り付いたままになること。
 *
 * カルーセルはスライドを transform で動かしており、transform の掛かった祖先は
 * position: fixed の基準になる。ポータルで body へ逃がしていないと、モーダルは
 * 画面ではなくスライドの箱を基準に置かれ、ページと一緒に流れて見えなくなる。
 */
export const InsideTransformedAncestor: Story = {
  args: { performance: fixturePerformance('sapporo') },
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
