import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { EditionCarousel } from './EditionCarousel'

/**
 * 横スワイプで年を送る箱。
 *
 * 中身が何であるかは知らず、`slideKey` が変わったら新しい面として出し直す。
 * ドラッグや年送りの動きを見るものなので、中身は色の付いた板で足りる。
 */
const meta = {
  title: 'Edition/EditionCarousel',
  component: EditionCarousel,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof EditionCarousel>

export default meta
type Story = StoryObj<typeof meta>

const YEARS = ['2090', '2091', '2092', '2093']
const TONES = ['#39C5BB', '#FFCC11', '#FFBACC', '#3366CC']

/** 実際と同じように、年を送れる状態で置く。左右に引くと切り替わる。 */
function Interactive() {
  const [index, setIndex] = useState(1)
  // 表示順で後ろへ動いたら 1、前へ動いたら -1
  const [direction, setDirection] = useState(0)

  const move = (step: number) => {
    setDirection(step)
    setIndex((current) => Math.min(YEARS.length - 1, Math.max(0, current + step)))
  }

  return (
    <div className="flex h-80 flex-col">
      <EditionCarousel
        slideKey={YEARS[index]!}
        direction={direction}
        canGoNewer={index > 0}
        canGoOlder={index < YEARS.length - 1}
        // タブの並びに合わせて、新しい年は前へ、古い年は後ろへ
        onNewer={() => move(-1)}
        onOlder={() => move(1)}
      >
        <div
          className="grid h-full place-items-center text-2xl font-black text-white"
          style={{ backgroundColor: TONES[index] }}
        >
          {YEARS[index]}
        </div>
      </EditionCarousel>

      <div className="flex justify-center gap-2 p-3">
        <button type="button" className="surface-card rounded px-3 py-1" onClick={() => move(-1)}>
          新しい年
        </button>
        <button type="button" className="surface-card rounded px-3 py-1" onClick={() => move(1)}>
          古い年
        </button>
      </div>
    </div>
  )
}

/** 年を送れる状態。ボタンでもドラッグでも切り替えられる。 */
export const Default: Story = {
  args: {
    slideKey: '2091',
    direction: 0,
    canGoNewer: true,
    canGoOlder: true,
    onNewer: () => {},
    onOlder: () => {},
    children: null,
  },
  render: () => <Interactive />,
}

/** 端の年。これ以上その向きへは送れないので、引いても戻る。 */
export const AtNewestEdge: Story = {
  args: {
    slideKey: '2093',
    direction: 0,
    canGoNewer: false,
    canGoOlder: true,
    onNewer: () => {},
    onOlder: () => {},
    children: (
      <div className="grid h-80 place-items-center bg-[#3366CC] text-2xl font-black text-white">
        2093
      </div>
    ),
  },
}
