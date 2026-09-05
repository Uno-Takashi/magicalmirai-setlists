import type { Meta, StoryObj } from '@storybook/react-vite'
import { EditionBackdrop } from './EditionBackdrop'
import { allEditionThemes } from './editionThemes'

/**
 * 開催回ごとの配色の一覧。
 *
 * `editionThemes.ts` の表をそのまま並べるので、年を足せばここにも自動で出る。
 * 1 枚ずつは `EditionBackdrop` のストーリーで大きく見られる。
 */
const meta = {
  title: 'Setlist/EditionThemes',
  component: EditionBackdrop,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof EditionBackdrop>

export default meta
type Story = StoryObj<typeof meta>

/** 見出しと白いカードを重ねて、実際の画面と同じ重なりで確かめる。 */
function ThemeTile({ slug }: { slug: string }) {
  const theme = allEditionThemes().find(([key]) => key === slug)?.[1]
  if (theme === undefined) return null

  return (
    <section className="surface-card relative h-96 overflow-hidden rounded-2xl">
      <EditionBackdrop theme={theme} />

      <div className="relative p-4">
        <p className="text-muted text-[11px] font-semibold tabular-nums">{slug}</p>
        <h2
          className="text-miku mt-1 text-2xl leading-snug font-black"
          style={theme.titleColor !== undefined ? { color: theme.titleColor } : undefined}
        >
          Hatsune Miku &quot;Magical Mirai {slug}&quot;
        </h2>
        <div className="surface-card mt-4 rounded-xl p-3 text-xs">
          セットリストのカードはこの上に乗る
        </div>
      </div>
    </section>
  )
}

/** 表にあるすべての開催回を並べる。 */
export const AllEditions: Story = {
  args: { theme: { colors: ['#ffffff'] } },
  render: () => (
    <div className="grid gap-4 p-4 lg:grid-cols-2">
      {allEditionThemes().map(([slug]) => (
        <ThemeTile key={slug} slug={slug} />
      ))}
    </div>
  ),
}
