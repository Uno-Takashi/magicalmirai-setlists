import { useCallback, useMemo, useState } from 'react'
import type { VocaloidId } from '@/domain/vocaloid/Vocaloid'
import { useCatalog } from '@/presentation/providers/CatalogProvider'

/**
 * ボーカロイドでの絞り込みの状態。
 *
 * 既定は全員 on。全員 on は「絞り込まない」と同じ意味なので、`filtering` が
 * false のときは検索結果に手を入れない (全員 on で 0 件になるのを防ぐ)。
 */
export function useVocaloidFilter() {
  const { catalog } = useCatalog()
  const all = useMemo(() => [...catalog.vocaloids.keys()], [catalog])
  const [selected, setSelected] = useState<ReadonlySet<VocaloidId>>(() => new Set(all))

  const toggle = useCallback((id: VocaloidId) => {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const reset = useCallback(() => setSelected(new Set(all)), [all])

  return { selected, toggle, reset, filtering: selected.size !== all.length }
}
