import type { Meta, StoryObj } from '@storybook/react-vite'
import type { Track } from '@/domain/setlist/Track'
import { fixtureMainEntry } from '@/fixtures/catalog'
import { TrackVariantRow } from './TrackVariantRow'

const { edition, setlists } = fixtureMainEntry
const tracks = setlists[0]!.tracks

/** 作り物のカタログから、順番で枠を取り出す。 */
function trackAt(order: number): Track {
  const track = tracks.find((candidate) => candidate.order === order)
  if (track === undefined) throw new Error(`${order} 番の枠が作り物のカタログにありません`)
  return track
}

/**
 * 曲順の枠に入る候補 1 つ分の行。
 *
 * 右の札は候補が「どの回で演奏されたか」で、`variantLabels` が組み立てる。
 * 固定曲では何も出ない。枠まるごとの見え方は `Setlist/TrackRow` にある。
 */
const meta = {
  title: 'Setlist/TrackVariantRow',
  component: TrackVariantRow,
  parameters: { layout: 'padded' },
  args: { edition, onSelect: () => {} },
} satisfies Meta<typeof TrackVariantRow>

export default meta
type Story = StoryObj<typeof meta>

/** 固定曲。候補が 1 つだけなので、演奏された回の札は出ない。 */
export const Fixed: Story = {
  args: { track: trackAt(1), variant: trackAt(1).variants[0]! },
}

/** 会場替わりの候補。公演地の名前と地図ピンが付く。 */
export const VenueVariant: Story = {
  args: { track: trackAt(2), variant: trackAt(2).variants[0]! },
}

/**
 * 昼夜入れ替えの候補。日付を並べるより「昼公演」の方が読みやすい。
 * この曲は合作でもあるので、作曲者の札が 2 つ並ぶ。
 */
export const SessionVariant: Story = {
  args: { track: trackAt(3), variant: trackAt(3).variants[0]! },
}

/**
 * 日程替わりの候補。会場では出し分けられていないので公演地は書かず、
 * 何日目かと昼夜だけを並べる。
 */
export const ScheduleVariant: Story = {
  args: { track: trackAt(4), variant: trackAt(4).variants[0]! },
}

/** 公演回をたどれない候補。出典に書かれていた条件をそのまま札にする。 */
export const NoteOnly: Story = {
  args: { track: trackAt(6), variant: trackAt(6).variants[0]! },
}

/** 長い曲名。折り返しても、右の札が潰れないかを確かめる。 */
export const LongTitle: Story = {
  args: { track: trackAt(4), variant: trackAt(4).variants[1]! },
}
