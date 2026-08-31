import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { loadCatalog } from '@/infrastructure/dataset/loadCatalog'
import { App } from '@/presentation/App'
import { CatalogProvider } from '@/presentation/providers/CatalogProvider'
import { LocaleProvider } from '@/presentation/providers/LocaleProvider'

const catalog = loadCatalog()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LocaleProvider>
      <CatalogProvider catalog={catalog}>
        <App />
      </CatalogProvider>
    </LocaleProvider>
  </StrictMode>,
)
