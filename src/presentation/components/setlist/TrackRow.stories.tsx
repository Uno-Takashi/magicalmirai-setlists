import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { sessionIndex } from '@/domain/edition/Edition'
import type { Track } from '@/domain/setlist/Track'
import { classifyVariation, type TrackVariation } from '@/domain/setlist/TrackVariation'
import { fixtureMainEntry } from '@/fixtures/catalog'
import { TrackRow } from './TrackRow'

const { edition, setlists } = fixtureMainEntry
const tracks = setlists[0]!.tracks

/** 作り物のカタログから、順番で枠を取り出す。 */
function trackAt(order: number): Track {
  const track = tracks.find((candidate) => candidate.order === order)
  if (track === undefined) throw new Error(`${order} 番の枠が作り物のカタログにありません`)
  return track
}

/** その枠が意図した入れ替わりに分類されることを確かめる。 */
function expectVariation(track: Track, expected: TrackVariation) {
  const sessions = sessionIndex(edition)
  expect(classifyVariation(track, (ref) => sessions.get(ref))).toBe(expected)
}

const meta = {
  title: 'Setlist/TrackRow',
  component: TrackRow,
  parameters: { layout: 'padded' },
  args: { index: 0, edition, onSelect: () => {} },
  // TrackRow は li なので、実際と同じ ol の中に置く。
  decorators: [
    (Story) => (
      <ol className="divide-[color:var(--surface-border)] divide-y">
        <Story />
      </ol>
    ),
  ],
} satisfies Meta<typeof TrackRow>

export default meta
type Story = StoryObj<typeof meta>

/** 候補が 1 つだけの固定曲。曲順・曲名・作曲者・歌唱者だけの最小の行。 */
export const Fixed: Story = {
  args: { track: trackAt(1) },
  play: () => expectVariation(trackAt(1), 'fixed'),
}

/** 会場替わり。候補ごとに公演地が出る。 */
export const VenueVariation: Story = {
  args: { track: trackAt(2) },
  play: () => expectVariation(trackAt(2), 'venue'),
}

/** 昼公演と夜公演で入れ替わるだけの枠。候補には「昼公演」「夜公演」が出る。 */
export const SessionVariation: Story = {
  args: { track: trackAt(3) },
  play: () => expectVariation(trackAt(3), 'session'),
}

/** 日程替わり。候補ごとに日付が出る。 */
export const ScheduleVariation: Story = {
  args: { track: trackAt(4) },
  play: () => expectVariation(trackAt(4), 'schedule'),
}

/** 公演回が記録されておらず、出典の但し書き (note) をそのまま出す枠。 */
export const WithNote: Story = {
  args: { track: trackAt(6) },
}

/** バンド紹介のタグが付いた枠。 */
export const BandIntro: Story = {
  args: { track: trackAt(7) },
}

/** 楽曲グランプリのタグが付いた枠。 */
export const GrandPrix: Story = {
  args: { track: trackAt(8) },
}

/** アンコールのテーマソング。多くの開催回がこの組み合わせになる。 */
export const EncoreThemeSong: Story = {
  args: { track: trackAt(10) },
}

/** 一覧の途中に現れる行。index に応じて出現アニメーションが遅れる。 */
export const Delayed: Story = {
  args: { track: trackAt(1), index: 20 },
}
