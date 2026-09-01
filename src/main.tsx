import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { loadCatalog } from '@/infrastructure/dataset/loadCatalog'
import { App } from '@/presentation/App'
import { CatalogProvider } from '@/presentation/providers/CatalogProvider'
import { DialogsProvider } from '@/presentation/providers/DialogsProvider'
import { LocaleProvider } from '@/presentation/providers/LocaleProvider'
import { NavigationProvider } from '@/presentation/providers/NavigationProvider'
import { PlayerProvider } from '@/presentation/providers/PlayerProvider'

const catalog = loadCatalog()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LocaleProvider>
      <CatalogProvider catalog={catalog}>
        <NavigationProvider>
          <DialogsProvider>
            <PlayerProvider>
              <App />
            </PlayerProvider>
          </DialogsProvider>
        </NavigationProvider>
      </CatalogProvider>
    </LocaleProvider>
  </StrictMode>,
)
