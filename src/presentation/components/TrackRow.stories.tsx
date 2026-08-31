import type { Meta, StoryObj } from '@storybook/react-vite'
import type { Track } from '@/domain/setlist/Track'
import type { TrackTag } from '@/domain/setlist/TrackTag'
import { classifyVariation, type TrackVariation } from '@/domain/setlist/TrackVariation'
import { loadCatalog } from '@/infrastructure/dataset/loadCatalog'
import { TrackRow } from './TrackRow'

const catalog = loadCatalog()

/**
 * データセット全体を走査して、条件に合う最初の枠とその開催回を取り出す。
 *
 * 年を決め打ちにすると dataset の更新でストーリーの意図がずれるので、
 * 「こういう枠」という条件で選ぶ。
 */
function trackWhere(match: (track: Track) => boolean, what: string) {
  for (const { edition, setlists } of catalog.entries) {
    for (const setlist of setlists) {
      const track = setlist.tracks.find(match)
      if (track !== undefined) return { track, edition }
    }
  }
  throw new Error(`${what} にあたる枠がデータセットにありません`)
}

/** 入れ替わりの分類で選ぶ。 */
function trackOf(variation: TrackVariation) {
  return trackWhere((track) => classifyVariation(track) === variation, variation)
}

/** タグで選ぶ。 */
function taggedTrack(tag: TrackTag) {
  return trackWhere((track) => track.tags.includes(tag), tag)
}

const meta = {
  title: 'Setlist/TrackRow',
  component: TrackRow,
  parameters: { layout: 'padded' },
  args: { index: 0, onSelect: () => {} },
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
  args: trackOf('fixed'),
}

/** 会場替わり。候補ごとに公演地が出る。 */
export const VenueVariation: Story = {
  args: trackOf('venue'),
}

/** 日程替わり。候補ごとに日付、または昼夜が出る。 */
export const ScheduleVariation: Story = {
  args: trackOf('schedule'),
}

/** 会場替わりとも日程替わりとも言えない日替わり。 */
export const DailyVariation: Story = {
  args: trackOf('daily'),
}

/** 公演回が記録されておらず、出典の但し書き (note) をそのまま出す枠。 */
export const WithNote: Story = {
  args: trackWhere(
    (track) => track.variants.some((variant) => variant.shows.length === 0 && variant.note != null),
    'note を持つ候補',
  ),
}

/** テーマソングのタグが付いた枠。 */
export const ThemeSong: Story = {
  args: taggedTrack('theme-song'),
}

/** 楽曲グランプリのタグが付いた枠。 */
export const GrandPrix: Story = {
  args: taggedTrack('grand-prix'),
}

/** アンコールのタグが付いた枠。 */
export const Encore: Story = {
  args: taggedTrack('encore'),
}

/** 一覧の途中に現れる行。index に応じて出現アニメーションが遅れる。 */
export const Delayed: Story = {
  args: { ...trackOf('fixed'), index: 20 },
}
