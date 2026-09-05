import { AnimatePresence } from 'motion/react'
import type { EditionEntry } from '@/domain/catalog/Catalog'
import { EditionBackdrop } from '@/presentation/components/edition/EditionBackdrop'
import { EditionCarousel } from '@/presentation/components/edition/EditionCarousel'
import { EditionSideNav } from '@/presentation/components/edition/EditionSideNav'
import { EditionView } from '@/presentation/components/edition/EditionView'
import { useEditionTheme } from '@/presentation/components/edition/useEditionTheme'
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

  // その年の背景。表に無い年とシンプルな表示のときは undefined で、素の地色になる。
  const theme = useEditionTheme(entry.edition.slug)

  return (
    <>
      <YearNavigator
        entries={entries}
        currentSlug={entry.edition.slug}
        onSelect={selectEdition}
        onNewer={goNewer}
        onOlder={goOlder}
      />

      <main className="relative flex flex-1 flex-col">
        {/*
          背景はスライドに乗せず、この層で入れ替える。mode="wait" なので
          前の年の色が地色まで引いてから、次の年の色が出る。中身の入れ替わりより
          先に終わるので、新しい年は色が整ったところへ滑り込む。
        */}
        <AnimatePresence initial={false} mode="wait">
          {theme !== undefined ? <EditionBackdrop key={entry.edition.slug} theme={theme} /> : null}
        </AnimatePresence>

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
