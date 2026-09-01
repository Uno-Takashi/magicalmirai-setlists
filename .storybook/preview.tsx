import type { Preview } from '@storybook/react-vite'
// Tailwind CSS + HeroUI のスタイルを Storybook 全体に適用する
import '../src/index.css'
import { loadCatalog } from '../src/infrastructure/dataset/loadCatalog'
import { CatalogProvider } from '../src/presentation/providers/CatalogProvider'
import { DialogsProvider } from '../src/presentation/providers/DialogsProvider'
import { FavoritesProvider } from '../src/presentation/providers/FavoritesProvider'
import { LocaleProvider } from '../src/presentation/providers/LocaleProvider'
import { NavigationProvider } from '../src/presentation/providers/NavigationProvider'
import { PreferencesProvider } from '../src/presentation/providers/PreferencesProvider'
import { PlayerProvider } from '../src/presentation/providers/PlayerProvider'

// 実データを使う。ストーリーがデータセットの変更に追従する。
const catalog = loadCatalog()

const preview: Preview = {
  parameters: {
    layout: 'centered',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
  decorators: [
    (Story) => (
      <LocaleProvider>
        <PreferencesProvider>
          <CatalogProvider catalog={catalog}>
            {/* 画面と同じ文脈でストーリーを描く。現在地や重なりの開閉を使う
              コンポーネントも、そのまま Storybook で確かめられる。 */}
            <NavigationProvider>
              <FavoritesProvider>
                <DialogsProvider>
                  <PlayerProvider>
                    <div className="w-full max-w-3xl p-6">
                      <Story />
                    </div>
                  </PlayerProvider>
                </DialogsProvider>
              </FavoritesProvider>
            </NavigationProvider>
          </CatalogProvider>
        </PreferencesProvider>
      </LocaleProvider>
    ),
  ],
}

export default preview
