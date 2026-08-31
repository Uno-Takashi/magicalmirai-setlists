import type { Meta, StoryObj } from '@storybook/react-vite'
import { findEntry } from '@/domain/catalog/Catalog'
import { loadCatalog } from '@/infrastructure/dataset/loadCatalog'
import { SetlistTimeline } from './SetlistTimeline'

const catalog = loadCatalog()

function entryOf(slug: string) {
  const entry = findEntry(catalog, slug)
  const setlist = entry?.setlists[0]
  if (entry === undefined || setlist === undefined) {
    throw new Error(`${slug} のセットリストがありません`)
  }
  return { setlist, edition: entry.edition }
}

const meta = {
  title: 'Setlist/SetlistTimeline',
  component: SetlistTimeline,
  parameters: { layout: 'padded' },
  args: { onSelectSong: () => {} },
} satisfies Meta<typeof SetlistTimeline>

export default meta
type Story = StoryObj<typeof meta>

/** 日替わり枠と昼夜差し替えの両方が入っている年。 */
export const WithVariants: Story = {
  args: entryOf('2023'),
}

/** 会場別の差し替えとボーナストラックがある年。 */
export const WithBonusTrack: Story = {
  args: entryOf('2018'),
}

/** 日替わりが一切ない最初期の公演。 */
export const FixedSetlist: Story = {
  args: entryOf('2013'),
}
