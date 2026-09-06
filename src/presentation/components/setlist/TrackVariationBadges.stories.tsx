import type { Meta, StoryObj } from '@storybook/react-vite'
import { TrackVariationBadges } from './TrackVariationBadges'

/**
 * その枠が何で入れ替わるのかを示す札。
 *
 * 軸そのものは `TrackVariation` が公演回の記録から計算する。ここはその結果を
 * 並べるだけなので、取りうる軸を一通り置いて見分けが付くかを確かめる。
 */
const meta = {
  title: 'Setlist/TrackVariationBadges',
  component: TrackVariationBadges,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof TrackVariationBadges>

export default meta
type Story = StoryObj<typeof meta>

/** 会場替わり。会場ごとに曲が違う。 */
export const Venue: Story = {
  args: { axes: ['venue'] },
}

/** 昼夜入れ替え。昼公演と夜公演で丸ごと入れ替わる。 */
export const Session: Story = {
  args: { axes: ['session'] },
}

/** 日程替わり。日で違うが、会場では出し分けられていない。 */
export const Schedule: Story = {
  args: { axes: ['schedule'] },
}

/** 日替わり。会場でも日程でも言い表せない入れ替わり。 */
export const Daily: Story = {
  args: { axes: ['daily'] },
}

/** 会場替わりかつ日程替わり。2 つの軸を並べて出す。 */
export const VenueAndSchedule: Story = {
  args: { axes: ['venue', 'schedule'] },
}

/** 全種類を並べ、アイコンで見分けが付くかを確かめる。 */
export const AllAxes: Story = {
  args: { axes: ['venue', 'session', 'schedule', 'daily'] },
}

/** 固定曲。軸を持たないので何も描画しない。 */
export const Fixed: Story = {
  args: { axes: [] },
}
