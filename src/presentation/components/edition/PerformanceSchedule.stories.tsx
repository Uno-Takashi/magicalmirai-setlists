import type { Meta, StoryObj } from '@storybook/react-vite'
import { fixturePerformance } from '@/fixtures/catalog'
import { PerformanceSchedule } from './PerformanceSchedule'

/**
 * 公演日程。
 *
 * 日程は年度ごとに微妙に異なるので、「例年 8 月」のような丸めはせず具体的な
 * 日付を出す。昼夜の区別がある年は札で、無い年はデータの表示ラベルで示す。
 */
const meta = {
  title: 'Edition/PerformanceSchedule',
  component: PerformanceSchedule,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof PerformanceSchedule>

export default meta
type Story = StoryObj<typeof meta>

/** 昼夜のある 3 日間の公演。 */
export const ThreeDays: Story = {
  args: { performance: fixturePerformance('tokyo') },
}

/** 日程の短い地方公演。最終日が昼だけで終わる。 */
export const ShortRun: Story = {
  args: { performance: fixturePerformance('sapporo') },
}

/** 昼夜の区別が無い年。データの表示ラベル (Day.1) をそのまま出す。 */
export const WithoutSessions: Story = {
  args: {
    performance: {
      ...fixturePerformance('tokyo'),
      shows: [
        { id: 'day1', date: '2090-08-01', label: 'Day.1' },
        { id: 'day2', date: '2090-08-02', label: 'Day.2' },
      ],
    },
  },
}

/** 1 日だけの公演。初期の開催回がこの形。 */
export const SingleDay: Story = {
  args: {
    performance: {
      ...fixturePerformance('tokyo'),
      shows: [{ id: 'day1', date: '2090-08-30', label: 'Day.1' }],
    },
  },
}
