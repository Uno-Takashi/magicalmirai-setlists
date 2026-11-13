import { createContext } from 'react'
import type { SongSearchIndex } from '@/application/searchSongs'
import type { Catalog } from '@/domain/catalog/Catalog'
import { useRequiredContext } from './requiredContext'

export interface CatalogContextValue {
  readonly catalog: Catalog
  /** 検索と曲ごとの照会に使う索引。カタログから 1 度だけ組み立てる。 */
  readonly searchIndex: SongSearchIndex
}

export const CatalogContext = createContext<CatalogContextValue | null>(null)

export function useCatalog(): CatalogContextValue {
  return useRequiredContext(CatalogContext, 'useCatalog')
}
