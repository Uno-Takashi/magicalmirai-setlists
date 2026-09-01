import { AppFooter } from '@/presentation/components/app/AppFooter'
import { AppHeader } from '@/presentation/components/app/AppHeader'
import { AppOverlays } from '@/presentation/components/app/AppOverlays'
import { usePageMeta } from '@/presentation/hooks/usePageMeta'
import { useSearchShortcut } from '@/presentation/hooks/useSearchShortcut'
import { EditionPage } from '@/presentation/pages/EditionPage'
import { StatisticsPage } from '@/presentation/pages/StatisticsPage'
import { useDialogs } from '@/presentation/providers/DialogsProvider'
import { useLocale } from '@/presentation/providers/LocaleProvider'
import { useNavigation } from '@/presentation/providers/NavigationProvider'

/** 現在地に応じたページ。開催回が 1 つも無いときだけ、空状態を出す。 */
function CurrentPage() {
  const { t } = useLocale()
  const { route, entry } = useNavigation()

  if (route.kind !== 'edition') return <StatisticsPage route={route} />
  if (entry === undefined) {
    return (
      <main className="grid min-h-full place-items-center p-8 text-center">
        <p className="text-muted text-sm">{t('edition.noSetlist')}</p>
      </main>
    )
  }
  return <EditionPage entry={entry} />
}

/**
 * 画面の外枠。ヘッダーと脚注でページを挟み、重なりをその上に置く。
 *
 * 現在地は `NavigationProvider`、重なりの開閉は `DialogsProvider` が持つので、
 * ここは組み立てだけを受け持つ。
 */
export function App() {
  const { openSearch } = useDialogs()
  usePageMeta()
  useSearchShortcut(openSearch)

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader />
      <CurrentPage />
      <AppFooter />
      <AppOverlays />
    </div>
  )
}
