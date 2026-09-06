import type { Meta, StoryObj } from '@storybook/react-vite'
import type { VocaloidTrendPoint } from '@/application/statistics'
import type { Edition } from '@/domain/edition/Edition'
import type { Vocaloid } from '@/domain/vocaloid/Vocaloid'
import { VocaloidTrendSection } from './VocaloidTrendSection'

const VOCALOIDS: Vocaloid[] = [
  { id: 'miku', name: { ja: '初音ミク', en: 'Hatsune Miku' }, color: '#39C5BB' },
  { id: 'rin', name: { ja: '鏡音リン', en: 'Kagamine Rin' }, color: '#FFCC11' },
  { id: 'len', name: { ja: '鏡音レン', en: 'Kagamine Len' }, color: '#FFEE11' },
]

function edition(slug: string, year: number): Edition {
  return { slug, year, name: { ja: `サンプルミライ ${slug}` }, performances: [], themeColors: [] }
}

/** 年ごとの曲数から、累計を足しながら推移の点を組み立てる。 */
function points(series: Record<string, number[]>): VocaloidTrendPoint[] {
  const length = Object.values(series)[0]?.length ?? 0
  const running = new Map<string, number>()

  return Array.from({ length }, (_, index) => {
    const perEdition = new Map<string, number>()
    const cumulative = new Map<string, number>()
    for (const [id, values] of Object.entries(series)) {
      const value = values[index] ?? 0
      perEdition.set(id, value)
      running.set(id, (running.get(id) ?? 0) + value)
      cumulative.set(id, running.get(id)!)
    }
    return { edition: edition(String(2090 + index), 2090 + index), perEdition, cumulative }
  })
}

/**
 * 年ごと / 累積を切り替えられる推移グラフの節。
 *
 * グラフ本体 (nivo) は別チャンクなので、切り替えの操作と読み込み中の高さの
 * 保ち方をここで確かめる。
 */
const meta = {
  title: 'Statistics/VocaloidTrendSection',
  component: VocaloidTrendSection,
  parameters: { layout: 'padded' },
  args: {
    title: 'ボーカロイド別の推移',
    help: (mode) => (mode === 'perEdition' ? 'その回で歌った曲数です。' : 'その回までの曲数です。'),
    vocaloids: VOCALOIDS,
    points: points({ miku: [8, 10, 12, 9], rin: [3, 4, 2, 5], len: [2, 3, 3, 4] }),
  },
} satisfies Meta<typeof VocaloidTrendSection>

export default meta
type Story = StoryObj<typeof meta>

/** 既定。「年ごと」から始まり、切り替えで累積になる。 */
export const Default: Story = {}

/** 開催回が 1 つだけ。線が引けないので点だけになる。 */
export const SingleEdition: Story = {
  args: { points: points({ miku: [8], rin: [3], len: [2] }) },
}

/** 途中から歌い始めたボーカロイドがいる場合。 */
export const LateJoiner: Story = {
  args: { points: points({ miku: [8, 10, 12, 9], rin: [0, 0, 4, 5], len: [0, 0, 0, 4] }) },
}
