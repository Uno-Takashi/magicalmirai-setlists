import { createContext, use, useMemo, type ReactNode } from 'react'
import { buildSongSearchIndex, type SongSearchIndex } from '@/application/searchSongs'
import type { Catalog } from '@/domain/catalog/Catalog'

interface CatalogContextValue {
  readonly catalog: Catalog
  readonly searchIndex: SongSearchIndex
}

const CatalogContext = createContext<CatalogContextValue | null>(null)

export function CatalogProvider({ catalog, children }: { catalog: Catalog; children: ReactNode }) {
  const value = useMemo<CatalogContextValue>(
    () => ({ catalog, searchIndex: buildSongSearchIndex(catalog) }),
    [catalog],
  )
  return <CatalogContext value={value}>{children}</CatalogContext>
}

export function useCatalog(): CatalogContextValue {
  const value = use(CatalogContext)
  if (value === null) throw new Error('CatalogProvider の外で useCatalog を呼び出しています')
  return value
}
