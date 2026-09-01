import type { IconType } from 'react-icons'
import { LuChartColumn, LuInfo, LuSearch, LuSettings } from 'react-icons/lu'
import type { TranslationKey } from '@/infrastructure/i18n/i18n'
import { HOME_URL } from '@/presentation/hooks/useRoute'
import { useDialogs } from '@/presentation/providers/DialogsProvider'
import { useLocale } from '@/presentation/providers/LocaleProvider'
import { useNavigation } from '@/presentation/providers/NavigationProvider'
import { AppLogo } from './AppLogo'

const ICON_BUTTON = 'surface-card rounded-lg p-2 transition hover:-translate-y-0.5 hover:shadow-md'

/** サイトのタイトル。押すとホーム (既定の開催回) へ戻る。 */
function HomeLink({ onNavigateHome }: { onNavigateHome: () => void }) {
  const { t } = useLocale()

  return (
    <h1 className="min-w-0 flex-1">
      {/*
        実際の href を持つアンカーにして、新しいタブで開く・リンクをコピーするといった
        ブラウザ本来の操作を残す。修飾キー無しの左クリックだけ SPA 内で遷移させる。
      */}
      <a
        href={HOME_URL}
        onClick={(event) => {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
          event.preventDefault()
          onNavigateHome()
        }}
        className="text-miku flex min-w-0 items-center gap-2 transition hover:opacity-70"
      >
        {/* マークはタイトルの文言と同じことを指すので、読み上げからは外す。 */}
        <AppLogo className="size-8 shrink-0" />
        {/*
          狭い画面ではマークだけにする。切り詰めても折り返しても読めないため。
          display:none で消すと、このリンクと h1 が読み上げ名を失う。
          sr-only は見た目だけを消して名前を残すので、こちらを使う。
        */}
        <span className="sr-only leading-tight font-black text-balance sm:not-sr-only sm:text-lg">
          {t('app.title')}
        </span>
      </a>
    </h1>
  )
}

export function AppHeader() {
  const { t } = useLocale()
  const { selectEdition, openStatistics } = useNavigation()
  const { openSearch, openAbout, openSettings } = useDialogs()

  // アイコンだけのボタンなので、読み上げ用の名前を必ず持たせる。
  const actions: { key: TranslationKey; icon: IconType; onClick: () => void }[] = [
    { key: 'search.open', icon: LuSearch, onClick: () => openSearch() },
    { key: 'statistics.open', icon: LuChartColumn, onClick: openStatistics },
    { key: 'about.open', icon: LuInfo, onClick: openAbout },
    { key: 'settings.open', icon: LuSettings, onClick: openSettings },
  ]

  return (
    <header className="mx-auto flex w-full max-w-3xl items-center gap-2 px-4 py-3">
      <HomeLink onNavigateHome={() => selectEdition('')} />

      {actions.map(({ key, icon: Icon, onClick }) => (
        <button
          key={key}
          type="button"
          onClick={onClick}
          aria-label={t(key)}
          className={ICON_BUTTON}
        >
          <Icon />
        </button>
      ))}
    </header>
  )
}
