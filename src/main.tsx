import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { loadCatalog } from '@/infrastructure/dataset/loadCatalog'
import { App } from '@/presentation/App'
import { AppProviders } from '@/presentation/providers/AppProviders'

const root = document.getElementById('root')
if (root === null) throw new Error('index.html に #root がありません')

createRoot(root).render(
  <StrictMode>
    <AppProviders catalog={loadCatalog()}>
      <App />
    </AppProviders>
  </StrictMode>,
)
