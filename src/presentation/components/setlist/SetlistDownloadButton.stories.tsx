import type { Meta, StoryObj } from '@storybook/react-vite'
import { findEntry } from '@/domain/catalog/Catalog'
import { loadCatalog } from '@/infrastructure/dataset/loadCatalog'
import { SetlistDownloadButton } from './SetlistDownloadButton'

const catalog = loadCatalog()

function entryOf(slug: string) {
  const entry = findEntry(catalog, slug)
  const setlist = entry?.setlists[0]
  if (entry === undefined || setlist === undefined) {
    throw new Error(`${slug} のセットリストがありません`)
  }
  return { setlist, edition: entry.edition, setlistIndex: 0, setlistCount: entry.setlists.length }
}

const meta = {
  title: 'Setlist/SetlistDownloadButton',
  component: SetlistDownloadButton,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof SetlistDownloadButton>

export default meta
type Story = StoryObj<typeof meta>

/** 日替わりや会場替わりのある年。候補ごとに 1 行として書き出す。 */
export const WithVariants: Story = {
  args: entryOf('2023'),
}

/** セットリストを 2 つ持つ年。ファイル名に通し番号が付く。 */
export const MultipleSetlists: Story = {
  args: entryOf('10th'),
}
