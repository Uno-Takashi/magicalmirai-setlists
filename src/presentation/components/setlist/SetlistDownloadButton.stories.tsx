import type { Meta, StoryObj } from '@storybook/react-vite'
import { fixtureMainEntry, fixtureMultiSetlistEntry } from '@/fixtures/catalog'
import { SetlistDownloadButton } from './SetlistDownloadButton'

const meta = {
  title: 'Setlist/SetlistDownloadButton',
  component: SetlistDownloadButton,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof SetlistDownloadButton>

export default meta
type Story = StoryObj<typeof meta>

/**
 * 日替わりや会場替わりのある回。候補ごとに 1 行として書き出す。
 * カンマを含む曲名 (Hello, Fixture) が引用符で囲まれることも、この回で確かめられる。
 */
export const WithVariants: Story = {
  args: {
    setlist: fixtureMainEntry.setlists[0]!,
    edition: fixtureMainEntry.edition,
    setlistIndex: 0,
    setlistCount: 1,
  },
}

/** セットリストを 2 つ持つ回。ファイル名に通し番号が付く。 */
export const MultipleSetlists: Story = {
  args: {
    setlist: fixtureMultiSetlistEntry.setlists[0]!,
    edition: fixtureMultiSetlistEntry.edition,
    setlistIndex: 0,
    setlistCount: fixtureMultiSetlistEntry.setlists.length,
  },
}
