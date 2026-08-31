import type { Meta, StoryObj } from '@storybook/react-vite'
import type { VocaloidTrendPoint } from '@/application/statistics'
import type { Edition } from '@/domain/edition/Edition'
import type { Vocaloid } from '@/domain/vocaloid/Vocaloid'
import { VocaloidTrendChart } from './VocaloidTrendChart'

const VOCALOIDS: Vocaloid[] = [
  { id: 'miku', name: { ja: '初音ミク', en: 'Hatsune Miku' }, color: '#39C5BB' },
  { id: 'rin', name: { ja: '鏡音リン', en: 'Kagamine Rin' }, color: '#FFCC11' },
  { id: 'len', name: { ja: '鏡音レン', en: 'Kagamine Len' }, color: '#FFEE11' },
]

function edition(slug: string, year: number): Edition {
  return {
    slug,
    year,
    name: { ja: `マジカルミライ ${slug}` },
    performances: [],
    themeColors: [],
  }
}

/** 年ごとの値と、その累積 (同じ曲を再演しても 1 曲) を組にする。 */
function points(series: Record<string, number[]>): VocaloidTrendPoint[] {
  const slugs = ['2021', '10th', '2023', '2024', '2025']
  const seen: Record<string, number> = {}
  return slugs.map((slug, index) => {
    const perEdition = new Map<string, number>()
    const cumulative = new Map<string, number>()
    for (const [id, values] of Object.entries(series)) {
      const value = values[index] ?? 0
      perEdition.set(id, value)
      // 再演を除いた累積のつもりなので、単純な足し算より少し増え方を鈍らせる
      seen[id] = (seen[id] ?? 0) + Math.ceil(value * 0.7)
      cumulative.set(id, seen[id])
    }
    return { edition: edition(slug, 2021 + index), perEdition, cumulative }
  })
}

const SERIES = { miku: [19, 27, 19, 24, 19], rin: [2, 7, 6, 3, 7], len: [2, 6, 5, 3, 6] }

const meta = {
  title: 'Statistics/VocaloidTrendChart',
  component: VocaloidTrendChart,
  parameters: { layout: 'padded' },
  args: { points: points(SERIES), vocaloids: VOCALOIDS },
} satisfies Meta<typeof VocaloidTrendChart>

export default meta
type Story = StoryObj<typeof meta>

/** その開催回で歌った曲数。段ごとに高さの基準を取るので、少ない段も推移が読める。 */
export const PerEdition: Story = {
  args: { mode: 'perEdition' },
}

/** その回までに歌った曲数。単調に増えるので右肩上がりになる。 */
export const Cumulative: Story = {
  args: { mode: 'cumulative' },
}
