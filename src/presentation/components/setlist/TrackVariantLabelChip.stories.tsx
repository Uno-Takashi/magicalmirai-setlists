import type { Meta, StoryObj } from '@storybook/react-vite'
import { LuMapPin } from 'react-icons/lu'
import { TbBrandDaysCounter } from 'react-icons/tb'
import { TrackVariantLabelChip } from './TrackVariantLabelChip'

/**
 * 候補の右に出す札。
 *
 * 文言は `trackVariantLabels.ts` が組み立てる。ここでは組み立て済みの札を
 * 直に渡して、崩れやすい形 (日程が多い・アイコンが無い) を意図して置く。
 */
const meta = {
  title: 'Setlist/TrackVariantLabelChip',
  component: TrackVariantLabelChip,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof TrackVariantLabelChip>

export default meta
type Story = StoryObj<typeof meta>

/** 公演地の札。地名だけを書き、地図ピンを添える。 */
export const Venue: Story = {
  args: { label: { text: 'サンプル大阪', icon: LuMapPin } },
}

/** 複数の公演地で演奏された候補。 */
export const MultipleVenues: Story = {
  args: { label: { text: 'サンプル東京・サンプル大阪', icon: LuMapPin } },
}

/** 昼公演だけの候補。日付を並べるより「昼公演」の方が読みやすい。 */
export const SessionOnly: Story = {
  args: { label: { text: '昼公演', icon: TbBrandDaysCounter } },
}

/** 日程だけの札。会場では出し分けられていないので、公演地は書かない。 */
export const Days: Story = {
  args: {
    label: {
      text: '',
      icon: TbBrandDaysCounter,
      days: [
        { day: 'Day.1', sessions: [] },
        { day: 'Day.3', sessions: [] },
      ],
    },
  },
}

/** 公演地ごとに日と昼夜を並べる札。日替わりの候補がこの形になる。 */
export const VenueWithSessions: Story = {
  args: {
    label: {
      text: 'サンプル東京',
      icon: LuMapPin,
      days: [
        { day: 'Day.1', sessions: ['matinee'] },
        { day: 'Day.2', sessions: ['evening'] },
      ],
    },
  },
}

/**
 * 出典の但し書き。アイコンを持たないので畳まない。
 * 畳むと何も残らず、札があること自体が見えなくなる。
 */
export const NoteWithoutIcon: Story = {
  args: { label: { text: 'サンプル東京公演のみ' } },
}

/** 文言も日程も無い札。何も描画しない。 */
export const Empty: Story = {
  args: { label: { text: '' } },
}
