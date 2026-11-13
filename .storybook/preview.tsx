import type { Preview } from '@storybook/react-vite'
// Tailwind CSS + HeroUI のスタイルを Storybook 全体に適用する
import '../src/index.css'
import { fixtureCatalog } from '../src/fixtures/catalog'
import { AppProviders } from '../src/presentation/providers/AppProviders'

const preview: Preview = {
  parameters: {
    layout: 'centered',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // 違反はテストの画面に出すだけで、CI は落とさない
    a11y: { test: 'todo' },
  },
  decorators: [
    // アプリ本体と同じ文脈で描く。現在地や重なりの開閉を使う部品も、そのまま確かめられる。
    // カタログは dataset ではなく作り物を使う。ストーリーの意図がデータの中身に
    // 縛られず、崩れやすい形 (長い曲名など) も意図して置ける。
    (Story) => (
      <AppProviders catalog={fixtureCatalog}>
        <div className="w-full max-w-3xl p-6">
          <Story />
        </div>
      </AppProviders>
    ),
  ],
}

export default preview
