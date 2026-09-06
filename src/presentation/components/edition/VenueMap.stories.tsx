import type { Meta, StoryObj } from '@storybook/react-vite'
import { fixturePerformance } from '@/fixtures/catalog'
import { VenueMap } from './VenueMap'

/**
 * 会場の場所。
 *
 * 会場名を Google マップの検索語として渡すだけで、緯度経度は持たない
 * (`venueMapUrl.ts`)。会場が未確定の年は何も出さない。
 *
 * **作り物の会場名なので、地図は目的の場所を指さない。** 確かめるのは
 * 枠の大きさと、読み上げ用の `title` が付いていること。
 */
const meta = {
  title: 'Edition/VenueMap',
  component: VenueMap,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof VenueMap>

export default meta
type Story = StoryObj<typeof meta>

/** 会場が決まっている公演。 */
export const Default: Story = {
  args: { performance: fixturePerformance('tokyo') },
}

/** 会場名だけでは引けない場所。dataset の mapQuery で検索語を上書きする。 */
export const WithMapQuery: Story = {
  args: {
    performance: { ...fixturePerformance('osaka'), mapQuery: 'ダミー国際展示場 西展示棟' },
  },
}

/** 会場が未確定の年。地図そのものを出さない。 */
export const Undecided: Story = {
  args: { performance: { ...fixturePerformance('tokyo'), venue: undefined } },
}
