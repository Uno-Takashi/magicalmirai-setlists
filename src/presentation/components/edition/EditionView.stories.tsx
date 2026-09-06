import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  fixtureMainEntry,
  fixtureMultiSetlistEntry,
  fixtureSingleEntry,
  fixtureUpcomingEntry,
} from '@/fixtures/catalog'
import { EditionView } from './EditionView'

/**
 * 1 つの開催回のページ。見出し・公演の情報・セットリストを組み立てる。
 *
 * 開催回は公演の数もセットリストの数も一定でないので、取りうる形を並べる。
 */
const meta = {
  title: 'Edition/EditionView',
  component: EditionView,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof EditionView>

export default meta
type Story = StoryObj<typeof meta>

/** 2 公演の回。日替わりや昼夜入れ替えを一通り持つ。 */
export const TwoPerformances: Story = {
  args: { entry: fixtureMainEntry },
}

/** 1 公演だけの回。初期の開催回にあたる。 */
export const SinglePerformance: Story = {
  args: { entry: fixtureSingleEntry },
}

/**
 * 3 公演でセットリストを 2 つ持つ回。
 * 公演地ごとに曲目が大きく違う年がこの形になるので、切り替えが出る。
 */
export const MultipleSetlists: Story = {
  args: { entry: fixtureMultiSetlistEntry },
}

/** これから開催する回。会場が未確定で、セットリストがまだ無い。 */
export const Upcoming: Story = {
  args: { entry: fixtureUpcomingEntry },
}
