import type { Meta, StoryObj } from '@storybook/react-vite'
import { EditionMotifArt } from './EditionMotifArt'
import { allEditionThemes, type EditionMotif } from './editionThemes'

/**
 * 開催回ごとのモチーフの絵。
 *
 * 1 つ 1 つは `motif/` に分かれていて、散らす位置と形は
 * `motif/motifGeometry.ts` が種を固定して決める (毎回同じ絵になる)。
 *
 * 絵は背景の色に重ねて初めて見えるものなので、その年の地色を敷いた上に置く。
 * 配色ごと並べた一覧は `Setlist/EditionThemes` にある。
 */
const meta = {
  title: 'Edition/EditionMotifArt',
  component: EditionMotifArt,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof EditionMotifArt>

export default meta
type Story = StoryObj<typeof meta>

/** そのモチーフを使っている年の地色を引く。 */
function themeOf(motif: EditionMotif) {
  return allEditionThemes().find(([, theme]) => theme.motif === motif)?.[1]
}

/** 地色を敷いた枠の中に、モチーフだけを描く。 */
function MotifTile({ motif }: { motif: EditionMotif }) {
  const theme = themeOf(motif)

  return (
    <section
      className="relative h-96 overflow-hidden rounded-2xl"
      style={{
        backgroundColor: theme?.colors[theme.colors.length - 1],
        backgroundImage:
          theme === undefined
            ? undefined
            : `linear-gradient(to bottom, ${theme.colors.join(', ')})`,
      }}
    >
      <EditionMotifArt motif={motif} />
      <p className="text-muted absolute top-3 left-4 text-[11px] font-semibold">{motif}</p>
    </section>
  )
}

const MOTIFS: readonly EditionMotif[] = [
  'sunflower',
  'starfield',
  'shapes',
  'neon',
  'cloud',
  'lantern',
  'dots',
  'cube',
  'prism',
]

/** すべてのモチーフを並べる。新しい絵を足すとここにも自動で出る。 */
export const AllMotifs: Story = {
  args: { motif: 'shapes' },
  render: () => (
    <div className="grid gap-4 p-4 lg:grid-cols-2">
      {MOTIFS.map((motif) => (
        <MotifTile key={motif} motif={motif} />
      ))}
    </div>
  ),
}

/** 2026: ヒマワリ。左右の端から覗かせる。 */
export const Sunflower: Story = {
  args: { motif: 'sunflower' },
  render: (args) => <MotifTile motif={args.motif} />,
}

/** 2025: 星を夜空に散らす。上ほど密にする。 */
export const Starfield: Story = {
  args: { motif: 'starfield' },
  render: (args) => <MotifTile motif={args.motif} />,
}

/** 2023: 白い線の図形を、色とりどりのネオンで光らせる。 */
export const Neon: Story = {
  args: { motif: 'neon' },
  render: (args) => <MotifTile motif={args.motif} />,
}

/** 2021: 空の高いところに雲を浮かべる。 */
export const Cloud: Story = {
  args: { motif: 'cloud' },
  render: (args) => <MotifTile motif={args.motif} />,
}

/** 2020: 提灯を上から吊るす。テーマの「MATSURI」に合わせた意匠。 */
export const Lantern: Story = {
  args: { motif: 'lantern' },
  render: (args) => <MotifTile motif={args.motif} />,
}

/** 2018: 面を割ってきらきらさせた立方体。 */
export const Cube: Story = {
  args: { motif: 'cube' },
  render: (args) => <MotifTile motif={args.motif} />,
}

/** 2017: 三角形を半透明で重ねた立方体。重なったところが濃くなる。 */
export const Prism: Story = {
  args: { motif: 'prism' },
  render: (args) => <MotifTile motif={args.motif} />,
}
