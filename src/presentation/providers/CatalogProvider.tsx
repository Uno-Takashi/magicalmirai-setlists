import { useMemo, type ReactNode } from 'react'
import { buildSongSearchIndex } from '@/application/searchSongs'
import type { Catalog } from '@/domain/catalog/Catalog'
import { CatalogContext, type CatalogContextValue } from './CatalogContext'

export function CatalogProvider({ catalog, children }: { catalog: Catalog; children: ReactNode }) {
  const value = useMemo<CatalogContextValue>(
    () => ({ catalog, searchIndex: buildSongSearchIndex(catalog) }),
    [catalog],
  )
  return <CatalogContext value={value}>{children}</CatalogContext>
}
