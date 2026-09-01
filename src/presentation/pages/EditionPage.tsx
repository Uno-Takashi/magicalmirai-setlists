import type { EditionEntry } from '@/domain/catalog/Catalog'
import { EditionCarousel } from '@/presentation/components/edition/EditionCarousel'
import { EditionSideNav } from '@/presentation/components/edition/EditionSideNav'
import { EditionView } from '@/presentation/components/edition/EditionView'
import { YearNavigator } from '@/presentation/components/edition/YearNavigator'
import { useKeyboardNavigation } from '@/presentation/hooks/useKeyboardNavigation'
import { useNavigation } from '@/presentation/providers/NavigationProvider'

/**
 * 開催回 1 つ分のページ。年を送る仕掛け (上のタブ・左右の矢印・横スワイプ) で
 * セットリストを囲う。
 */
export function EditionPage({ entry }: { entry: EditionEntry }) {
  const { entries, direction, canGoNewer, canGoOlder, goNewer, goOlder, selectEdition } =
    useNavigation()
  useKeyboardNavigation(goNewer, goOlder)

  return (
    <>
      <YearNavigator
        entries={entries}
        currentSlug={entry.edition.slug}
        onSelect={selectEdition}
        onNewer={goNewer}
        onOlder={goOlder}
      />

      <main className="flex flex-1 flex-col">
        <EditionCarousel
          slideKey={entry.edition.slug}
          direction={direction}
          canGoNewer={canGoNewer}
          canGoOlder={canGoOlder}
          onNewer={goNewer}
          onOlder={goOlder}
        >
          <EditionView entry={entry} />
        </EditionCarousel>
      </main>

      <EditionSideNav
        canGoNewer={canGoNewer}
        canGoOlder={canGoOlder}
        onNewer={goNewer}
        onOlder={goOlder}
      />
    </>
  )
}
