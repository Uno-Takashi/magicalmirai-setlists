import type { ReactNode } from 'react'
import type { Catalog } from '@/domain/catalog/Catalog'
import { CatalogProvider } from './CatalogProvider'
import { DialogsProvider } from './DialogsProvider'
import { FavoritesProvider } from './FavoritesProvider'
import { LocaleProvider } from './LocaleProvider'
import { NavigationProvider } from './NavigationProvider'
import { PlayerProvider } from './PlayerProvider'
import { PreferencesProvider } from './PreferencesProvider'

/**
 * アプリ全体の文脈を正しい順で重ねる。アプリ本体 (`main.tsx`) と Storybook
 * (`.storybook/preview.tsx`) がこれを共有するので、ストーリーも画面と同じ
 * 文脈の中で描かれる。
 *
 * 並びには依存がある。`NavigationProvider` は既定の開催回を決めるのにカタログを読む。
 */
export function AppProviders({ catalog, children }: { catalog: Catalog; children: ReactNode }) {
  return (
    <LocaleProvider>
      <PreferencesProvider>
        <CatalogProvider catalog={catalog}>
          <NavigationProvider>
            <FavoritesProvider>
              <DialogsProvider>
                <PlayerProvider>{children}</PlayerProvider>
              </DialogsProvider>
            </FavoritesProvider>
          </NavigationProvider>
        </CatalogProvider>
      </PreferencesProvider>
    </LocaleProvider>
  )
}
