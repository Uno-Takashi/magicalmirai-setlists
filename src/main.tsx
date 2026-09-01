import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { loadCatalog } from '@/infrastructure/dataset/loadCatalog'
import { App } from '@/presentation/App'
import { CatalogProvider } from '@/presentation/providers/CatalogProvider'
import { DialogsProvider } from '@/presentation/providers/DialogsProvider'
import { FavoritesProvider } from '@/presentation/providers/FavoritesProvider'
import { LocaleProvider } from '@/presentation/providers/LocaleProvider'
import { NavigationProvider } from '@/presentation/providers/NavigationProvider'
import { PreferencesProvider } from '@/presentation/providers/PreferencesProvider'
import { PlayerProvider } from '@/presentation/providers/PlayerProvider'

const catalog = loadCatalog()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LocaleProvider>
      <PreferencesProvider>
        <CatalogProvider catalog={catalog}>
          <NavigationProvider>
            <FavoritesProvider>
              <DialogsProvider>
                <PlayerProvider>
                  <App />
                </PlayerProvider>
              </DialogsProvider>
            </FavoritesProvider>
          </NavigationProvider>
        </CatalogProvider>
      </PreferencesProvider>
    </LocaleProvider>
  </StrictMode>,
)
