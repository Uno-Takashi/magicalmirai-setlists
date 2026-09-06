import type { Meta, StoryObj } from '@storybook/react-vite'
import { AppOverlays } from './AppOverlays'

/**
 * 画面に重ねるものをまとめて描く場所。
 *
 * どれを開いているかは `DialogsProvider` が持つので、このコンポーネント自身は
 * props を取らない。ストーリーでは何も開いていない状態だけを置き、
 * それぞれの重なりは `App/AboutDialog` などのストーリーで個別に見る。
 *
 * ここで確かめたいのは、**何も開いていないときに画面へ何も足さないこと**。
 * 重なりが閉じているのに透明な層が残ると、後ろの操作が押せなくなる。
 */
const meta = {
  title: 'App/AppOverlays',
  component: AppOverlays,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AppOverlays>

export default meta
type Story = StoryObj<typeof meta>

/** 何も開いていない状態。後ろのボタンがそのまま押せる。 */
export const AllClosed: Story = {
  render: () => (
    <div className="p-6">
      <button type="button" className="surface-card rounded px-3 py-2 text-sm">
        後ろのボタン
      </button>
      <AppOverlays />
    </div>
  ),
}
